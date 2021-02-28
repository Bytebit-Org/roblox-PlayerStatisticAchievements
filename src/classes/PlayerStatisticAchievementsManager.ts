import { Dumpster } from "@rbxts/dumpster";
import { StatisticsDefinition, StatisticsSnapshot } from "@rbxts/player-statistics";
import { IPlayerStatisticsReader } from "@rbxts/player-statistics/out/interfaces/IPlayerStatisticsReader";
import {
	IRewardContainer,
	IRewardGranter,
	IRewardsOpeningCoordinator,
	Reward,
	StandardRewardContainer,
	StandardRewardsOpeningCoordinator,
} from "@rbxts/reward-containers";
import { Players } from "@rbxts/services";
import { ISignal } from "@rbxts/signals-tooling";
import { DumpsterFactory, DumpsterFactoryInstance } from "factories/DumpsterFactory";
import { GenericFactory } from "factories/GenericFactory";
import { SignalFactory } from "factories/SignalFactory";
import { IPlayerStatisticAchievementsManager } from "interfaces/IPlayerStatisticAchievementsManager";
import { AchievementDescription } from "types/AchievementDescription";
import { AchievementsDefinition } from "types/AchievementsDefinition";

function getClampedProgress<StatsDef extends StatisticsDefinition>(
	achievementDescription: AchievementDescription<StatsDef>,
	statisticsSnapshot: StatisticsSnapshot<StatsDef>,
) {
	return math.clamp(achievementDescription.getProgress(statisticsSnapshot), 0, 1);
}

/**
 * The standard player statistic achievements manager.
 * This manager will handle listening for statistics to load for each player and cleaning up when players leave.
 * Its main purpose, though, is to listen for each player to complete an achievement and then grant them the associated rewards.
 */
export class PlayerStatisticAchievementsManager<
	StatsDef extends StatisticsDefinition,
	AchvmtsDef extends AchievementsDefinition<StatsDef>
> implements IPlayerStatisticAchievementsManager<StatsDef, AchvmtsDef> {
	public readonly achievementCompleted: ISignal<(player: Player, achievementName: keyof AchvmtsDef) => void>;
	public readonly achievementRewardGranted: ISignal<
		(player: Player, achievementName: keyof AchvmtsDef, rewards: ReadonlyArray<Reward>) => void
	>;

	private readonly completedAchievementNamesByPlayer: Map<Player, Set<keyof AchvmtsDef>>;
	private readonly dumpster: Dumpster;
	private isDestroyed: boolean;

	/**
	 * Use the create method instead
	 */
	private constructor(
		private readonly achievementsDefinition: AchvmtsDef,
		dumpsterFactory: DumpsterFactory,
		private readonly playersService: Players,
		private readonly rewardContainerFactory: GenericFactory<
			IRewardContainer,
			typeof StandardRewardContainer.create
		>,
		private readonly rewardGrantersByRewardType: ReadonlyMap<string, IRewardGranter>,
		private readonly rewardsOpeningCoordinatorFactory: GenericFactory<
			IRewardsOpeningCoordinator,
			typeof StandardRewardsOpeningCoordinator.create
		>,
		private readonly playerStatisticsReader: IPlayerStatisticsReader<StatsDef>,
		signalFactory: SignalFactory,
	) {
		this.achievementCompleted = signalFactory.createInstance();
		this.achievementRewardGranted = signalFactory.createInstance();

		this.completedAchievementNamesByPlayer = new Map();
		this.dumpster = dumpsterFactory.createInstance();
		this.isDestroyed = false;

		this.dumpster.dump(this.achievementCompleted);
		this.dumpster.dump(this.achievementRewardGranted);

		this.dumpster.dump(this.completedAchievementNamesByPlayer, (map) => map.clear());

		this.listenForRelevantStatisticUpdates();
		this.listenForPlayerStatisticsToLoad();
		this.listenForPlayersToLeave();
	}

	/**
	 * Creates a new instance
	 * @param this
	 * @param achievementsDefinition The definition of achievements.
	 * @param rewardGrantersByRewardType The reward granters keyed by the reward type they grant.
	 * @param playerStatisticsReader The player statistics reader to use for listening to statistics updates and monitoring for completed achievements.
	 */
	public static create<StatsDef extends StatisticsDefinition, AchvmtsDef extends AchievementsDefinition<StatsDef>>(
		this: void,
		achievementsDefinition: AchvmtsDef,
		rewardGrantersByRewardType: ReadonlyMap<string, IRewardGranter>,
		playerStatisticsReader: IPlayerStatisticsReader<StatsDef>,
	): IPlayerStatisticAchievementsManager<StatsDef, AchvmtsDef> {
		return new PlayerStatisticAchievementsManager(
			achievementsDefinition,
			DumpsterFactoryInstance,
			Players,
			new GenericFactory(StandardRewardContainer.create),
			rewardGrantersByRewardType,
			new GenericFactory(StandardRewardsOpeningCoordinator.create),
			playerStatisticsReader,
			new SignalFactory(),
		);
	}

	public destroy() {
		if (this.isDestroyed) {
			warn(`Attempt to destroy an already destroyed instance of type ${getmetatable(this)}`);
			return;
		}

		this.dumpster.burn();
		this.isDestroyed = true;
	}

	public getProgressOnAchievementForPlayer(achievementName: keyof AchvmtsDef, player: Player) {
		if (this.isDestroyed) {
			throw `Attempt to call a method on a destroyed instance of type ${getmetatable(this)}`;
		}

		if (!this.playerStatisticsReader.areStatisticsLoadedForPlayer(player)) {
			throw `Cannot get progress on achievement ${achievementName} because the statistics are not yet loaded for player ${player.Name}`;
		}

		const statisticsSnapshotForPlayer = this.playerStatisticsReader.getStatisticsSnapshotForPlayer(player);

		const achievementDescription = this.achievementsDefinition[achievementName];
		return getClampedProgress(achievementDescription, statisticsSnapshotForPlayer);
	}

	private listenForRelevantStatisticUpdates() {
		for (const [achievementName, achievementDescription] of pairs(this.achievementsDefinition)) {
			for (const statisticName of achievementDescription.relevantStatisticNames) {
				this.dumpster.dump(
					this.playerStatisticsReader.subscribeToStatisticUpdates(
						statisticName,
						(player, newValue, oldValue) => {
							const completedAchievementNamesForPlayer = this.completedAchievementNamesByPlayer.get(
								player,
							);
							if (completedAchievementNamesForPlayer === undefined) {
								warn(
									`Player ${player.Name} has updated statistic "${statisticName}" but their achievements are not yet ready for processing`,
								);
								return;
							}

							if (completedAchievementNamesForPlayer.has(achievementName)) {
								return;
							}

							const statisticsSnapshotForPlayer = this.playerStatisticsReader.getStatisticsSnapshotForPlayer(
								player,
							);

							const progress = getClampedProgress(achievementDescription, statisticsSnapshotForPlayer);
							if (progress === 1) {
								completedAchievementNamesForPlayer.add(achievementName);
								this.achievementCompleted.fire(player, achievementName);

								const rewardsOpeningCoordinator = this.rewardsOpeningCoordinatorFactory.createInstance(
									achievementDescription.rewardsSelector,
									this.rewardGrantersByRewardType,
								);

								const rewardContainer = this.rewardContainerFactory.createInstance(
									player,
									rewardsOpeningCoordinator,
								);

								const rewardContainerOpenedConnection = rewardContainer.opened.Connect((rewards) => {
									rewardContainerOpenedConnection.Disconnect();

									this.achievementRewardGranted.fire(player, achievementName, rewards);
								});

								rewardContainer.openAsync();
							}
						},
					),
				);
			}
		}
	}

	private listenForPlayerStatisticsToLoad() {
		this.dumpster.dump(
			this.playerStatisticsReader.statisticsLoadedForPlayer.Connect((player) => {
				const statisticsSnapshotForPlayer = this.playerStatisticsReader.getStatisticsSnapshotForPlayer(player);
				const achievementsCompletedForPlayer = new Set<keyof AchvmtsDef>();

				for (const [achievementName, achievementDescription] of pairs(this.achievementsDefinition)) {
					if (getClampedProgress(achievementDescription, statisticsSnapshotForPlayer) === 1) {
						achievementsCompletedForPlayer.add(achievementName);
					}
				}

				this.completedAchievementNamesByPlayer.set(player, achievementsCompletedForPlayer);
			}),
		);
	}

	private listenForPlayersToLeave() {
		this.dumpster.dump(
			this.playersService.PlayerRemoving.Connect((player) => {
				this.completedAchievementNamesByPlayer.delete(player);
			}),
		);
	}
}
