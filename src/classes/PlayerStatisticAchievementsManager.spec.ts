/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/consistent-type-assertions */
/// <reference types="@rbxts/testez/globals" />

import { Dumpster } from "@rbxts/dumpster";
import fitumi from "@rbxts/fitumi";
import { a } from "@rbxts/fitumi";
import {
	IPlayerStatisticsReader,
	PlayerStatisticsProvider,
	StandardStatisticUpdateFunctions,
	StatisticsSnapshot,
} from "@rbxts/player-statistics";
import {
	IRewardContainer,
	IRewardGranter,
	IRewardsOpeningCoordinator,
	IRewardsSelector,
	StandardRewardContainer,
	StandardRewardsOpeningCoordinator,
} from "@rbxts/reward-containers";
import { HttpService } from "@rbxts/services";
import { ISignal } from "@rbxts/signals-tooling";
import { DumpsterFactory, DumpsterFactoryInstance } from "factories/DumpsterFactory";
import { GenericFactory } from "factories/GenericFactory";
import { SignalFactory } from "factories/SignalFactory";
import { createFakeSignal } from "functions/UnitTesting/CreateFakeSignal";
import { AchievementDescription } from "types/AchievementDescription";
import { AchievementsDefinition } from "types/AchievementsDefinition";
import { PlayerStatisticAchievementsManager } from "./PlayerStatisticAchievementsManager";

type Mutable<T> = {
	-readonly [P in keyof T]: T[P];
};

type StatisticUpdatedHandler = (player: Player, newValue: number, oldValue: number) => void;

function createDefaultPlayersService() {
	const playersService = a.fake<Players>();

	playersService.PlayerAdded = new Instance("BindableEvent").Event;
	playersService.PlayerRemoving = new Instance("BindableEvent").Event;

	a.callTo(playersService.GetPlayers as {}, playersService).returns([]);

	return playersService;
}

function createFakePlayer() {
	const player = {
		Name: HttpService.GenerateGUID(),
		UserId: math.random(1, 2 ** 20),
	} as Mutable<Player>;

	return player;
}

function createDefaultRewardsOpeningCoordinator() {
	const rewardsOpeningCoordinator = a.fake<IRewardsOpeningCoordinator>();
	a.callTo(
		rewardsOpeningCoordinator.coordinateOpeningAsync as {},
		rewardsOpeningCoordinator,
		fitumi.wildcard,
	).returns(a.valueGeneratorCallback(() => Promise.resolve([])));

	return rewardsOpeningCoordinator;
}

function createDefaultRewardsSelector() {
	const rewardsSelector = a.fake<IRewardsSelector>();
	a.callTo(rewardsSelector.selectRewardsAsync as {}, rewardsSelector).returns(
		a.valueGeneratorCallback(() => Promise.resolve([])),
	);

	return rewardsSelector;
}

function createDefaultPlayerStatisticsReader() {
	const playerStatisticsReader = a.fake<IPlayerStatisticsReader<typeof statsDef>>();

	playerStatisticsReader.statisticsLoadedForPlayer = createFakeSignal();

	const statisticsUpdatedForPlayerSignal = createFakeSignal<StatisticUpdatedHandler>();
	playerStatisticsReader.subscribeToStatisticUpdates = ((
		_: keyof typeof statsDef,
		handler: StatisticUpdatedHandler,
	) => {
		return statisticsUpdatedForPlayerSignal.Connect(handler);
	}) as typeof playerStatisticsReader.subscribeToStatisticUpdates;

	return playerStatisticsReader;
}

function createFakeSignalFactory() {
	const signalFactory = a.fake<SignalFactory>();

	a.callTo(signalFactory.createInstance as {}, signalFactory).returns(a.valueGeneratorCallback(createFakeSignal));

	return signalFactory;
}

function ensureExtends<S, T extends S>(value: T): T {
	return value;
}

const statsDef = {
	increment: {
		defaultValue: 0,
		updateFunction: StandardStatisticUpdateFunctions.increment,
	},
	max: {
		defaultValue: -math.huge,
		updateFunction: math.max,
	},
	sum: {
		defaultValue: 0,
		updateFunction: StandardStatisticUpdateFunctions.sum,
	},
};

const achievementsDef = {
	incrementHit5: identity<AchievementDescription<typeof statsDef>>({
		getProgress: (statsSnap) => statsSnap.increment / 5,
		relevantStatisticNames: ["increment"],
		rewardsSelector: createDefaultRewardsSelector(),
	}),
	maxHit50: identity<AchievementDescription<typeof statsDef>>({
		getProgress: (statsSnap) => (statsSnap.max >= 50 ? 1 : 0),
		relevantStatisticNames: ["max"],
		rewardsSelector: createDefaultRewardsSelector(),
	}),
	sumHit100: identity<AchievementDescription<typeof statsDef>>({
		getProgress: (statsSnap) => statsSnap.sum / 100,
		relevantStatisticNames: ["sum"],
		rewardsSelector: createDefaultRewardsSelector(),
	}),
};
ensureExtends<AchievementsDefinition<typeof statsDef>, typeof achievementsDef>(achievementsDef);

class UnitTestablePlayerStatisticAchievementsManager extends PlayerStatisticAchievementsManager<
	typeof statsDef,
	typeof achievementsDef
> {
	public isUnlocked = true;

	public constructor(
		args?: Partial<{
			dumpsterFactory: DumpsterFactory;
			playersService: Players;
			rewardGrantersByRewardType: ReadonlyMap<string, IRewardGranter>;
			rewardsOpeningCoordinatorFactory: GenericFactory<
				IRewardsOpeningCoordinator,
				typeof StandardRewardsOpeningCoordinator.create
			>;
			playerStatisticsReader: IPlayerStatisticsReader<typeof statsDef>;
			signalFactory: SignalFactory;
		}>,
	) {
		super(
			achievementsDef,
			args?.dumpsterFactory ?? DumpsterFactoryInstance,
			args?.playersService ?? createDefaultPlayersService(),
			args?.rewardGrantersByRewardType ?? new Map(),
			args?.rewardsOpeningCoordinatorFactory ??
				((new GenericFactory(createDefaultRewardsOpeningCoordinator) as unknown) as GenericFactory<
					IRewardsOpeningCoordinator,
					typeof StandardRewardsOpeningCoordinator.create
				>),
			args?.playerStatisticsReader ?? createDefaultPlayerStatisticsReader(),
			args?.signalFactory ?? createFakeSignalFactory(),
		);
	}

	public canOpen() {
		return this.isUnlocked;
	}
}

export = () => {
	// IDestroyable
	describe("destroy", () => {
		it("should call burn on the instance's dumpster", () => {
			const dumpster = a.fake<Dumpster>();
			const dumpsterFactory = a.fake<DumpsterFactory>();
			a.callTo(dumpsterFactory.createInstance as {}, dumpsterFactory).returns(dumpster);

			const playerStatisticAchievementsManager = new UnitTestablePlayerStatisticAchievementsManager({
				dumpsterFactory: dumpsterFactory as DumpsterFactory,
			});

			playerStatisticAchievementsManager.destroy();

			expect(a.callTo(dumpster.burn as {}, dumpster).didHappen()).to.equal(true);
		});
	});

	function runBasicSetUp(): [
		Mutable<StatisticsSnapshot<typeof statsDef>>,
		ISignal<StatisticUpdatedHandler>,
		UnitTestablePlayerStatisticAchievementsManager,
		Mutable<Player>,
	] {
		const player = createFakePlayer();
		const currentStatisticSnapshot = identity<Mutable<StatisticsSnapshot<typeof statsDef>>>({
			increment: 0,
			max: 0,
			sum: 0,
		});

		const statisticsLoadedForPlayerSignal = createFakeSignal<(player: Player) => void>();
		const statisticsUpdatedForPlayerSignal = createFakeSignal<StatisticUpdatedHandler>();

		const playerStatisticsReader = a.fake<IPlayerStatisticsReader<typeof statsDef>>();
		playerStatisticsReader.statisticsLoadedForPlayer = statisticsLoadedForPlayerSignal;
		playerStatisticsReader.subscribeToStatisticUpdates = ((
			_: keyof typeof statsDef,
			handler: StatisticUpdatedHandler,
		) => {
			return statisticsUpdatedForPlayerSignal.Connect(handler);
		}) as typeof playerStatisticsReader.subscribeToStatisticUpdates;

		a.callTo(playerStatisticsReader.areStatisticsLoadedForPlayer as {}, playerStatisticsReader, player).returns(
			true,
		);

		a.callTo(
			playerStatisticsReader.getStatisticsSnapshotForPlayer as {},
			playerStatisticsReader,
			fitumi.wildcard,
		).returns(currentStatisticSnapshot);

		const playerStatisticAchievementsManager = new UnitTestablePlayerStatisticAchievementsManager({
			playerStatisticsReader,
		});

		statisticsLoadedForPlayerSignal.fire(player);

		return [currentStatisticSnapshot, statisticsUpdatedForPlayerSignal, playerStatisticAchievementsManager, player];
	}

	// IPlayerStatisticsAchievementManager
	describe("achievementCompleted signal", () => {
		it("should throw if a connect is attempted after destroying the instance", () => {
			const playerStatisticAchievementsManager = new UnitTestablePlayerStatisticAchievementsManager({
				signalFactory: new SignalFactory(),
			});

			playerStatisticAchievementsManager.destroy();

			expect(() => playerStatisticAchievementsManager.achievementCompleted.Connect(() => {})).to.throw();
		});

		it("should not be fired for statistic updates that don't complete any achievements", () => {
			const [_, statisticsUpdatedForPlayerSignal, playerStatisticAchievementsManager, player] = runBasicSetUp();

			let numberOfAchievementCompletedSignalsFired = 0;
			playerStatisticAchievementsManager.achievementCompleted.Connect(
				() => ++numberOfAchievementCompletedSignalsFired,
			);

			statisticsUpdatedForPlayerSignal.fire(player, 1, 0);

			expect(numberOfAchievementCompletedSignalsFired).to.equal(0);
		});

		it("should only fire once for an achievement that has been completed", () => {
			const [
				currentStatisticSnapshot,
				statisticsUpdatedForPlayerSignal,
				playerStatisticAchievementsManager,
				player,
			] = runBasicSetUp();

			let numberOfAchievementCompletedSignalsFired = 0;
			playerStatisticAchievementsManager.achievementCompleted.Connect(
				() => ++numberOfAchievementCompletedSignalsFired,
			);

			currentStatisticSnapshot.increment = 5;

			statisticsUpdatedForPlayerSignal.fire(player, 1, 0);
			statisticsUpdatedForPlayerSignal.fire(player, 2, 1);

			expect(numberOfAchievementCompletedSignalsFired).to.equal(1);
		});

		it("should fire for all achievements completed but not others", () => {
			const [
				currentStatisticSnapshot,
				statisticsUpdatedForPlayerSignal,
				playerStatisticAchievementsManager,
				player,
			] = runBasicSetUp();

			const completedAchievementNames = new Set<keyof typeof achievementsDef>();
			playerStatisticAchievementsManager.achievementCompleted.Connect((_, achievementName) =>
				completedAchievementNames.add(achievementName),
			);

			currentStatisticSnapshot.increment = 1;
			currentStatisticSnapshot.max = 100;
			currentStatisticSnapshot.sum = 100;

			statisticsUpdatedForPlayerSignal.fire(player, 1, 0);

			expect(completedAchievementNames.size()).to.equal(2);
			expect(completedAchievementNames.has("incrementHit5")).to.equal(false);
			expect(completedAchievementNames.has("maxHit50")).to.equal(true);
			expect(completedAchievementNames.has("sumHit100")).to.equal(true);
		});
	});

	describe("achievementRewardGranted signal", () => {
		it("should throw if a connect is attempted after destroying the instance", () => {
			const playerStatisticAchievementsManager = new UnitTestablePlayerStatisticAchievementsManager({
				signalFactory: new SignalFactory(),
			});

			playerStatisticAchievementsManager.destroy();

			expect(() => playerStatisticAchievementsManager.achievementRewardGranted.Connect(() => {})).to.throw();
		});

		it("should not be fired for statistic updates that don't complete any achievements", () => {
			const [_, statisticsUpdatedForPlayerSignal, playerStatisticAchievementsManager, player] = runBasicSetUp();

			let numberOfAchievementRewardGrantedSignalsFired = 0;
			playerStatisticAchievementsManager.achievementRewardGranted.Connect(
				() => ++numberOfAchievementRewardGrantedSignalsFired,
			);

			statisticsUpdatedForPlayerSignal.fire(player, 1, 0);

			expect(numberOfAchievementRewardGrantedSignalsFired).to.equal(0);
		});

		it("should only fire once for an achievement that has been completed", () => {
			const [
				currentStatisticSnapshot,
				statisticsUpdatedForPlayerSignal,
				playerStatisticAchievementsManager,
				player,
			] = runBasicSetUp();

			let numberOfAchievementRewardGrantedSignalsFired = 0;
			playerStatisticAchievementsManager.achievementRewardGranted.Connect(
				() => ++numberOfAchievementRewardGrantedSignalsFired,
			);

			currentStatisticSnapshot.increment = 5;

			statisticsUpdatedForPlayerSignal.fire(player, 1, 0);
			statisticsUpdatedForPlayerSignal.fire(player, 2, 1);

			expect(numberOfAchievementRewardGrantedSignalsFired).to.equal(1);
		});

		it("should fire for all achievements completed but not others", () => {
			const [
				currentStatisticSnapshot,
				statisticsUpdatedForPlayerSignal,
				playerStatisticAchievementsManager,
				player,
			] = runBasicSetUp();

			const completedAchievementNames = new Set<keyof typeof achievementsDef>();
			playerStatisticAchievementsManager.achievementRewardGranted.Connect((_, achievementName) =>
				completedAchievementNames.add(achievementName),
			);

			currentStatisticSnapshot.increment = 1;
			currentStatisticSnapshot.max = 100;
			currentStatisticSnapshot.sum = 100;

			statisticsUpdatedForPlayerSignal.fire(player, 1, 0);

			expect(completedAchievementNames.size()).to.equal(2);
			expect(completedAchievementNames.has("incrementHit5")).to.equal(false);
			expect(completedAchievementNames.has("maxHit50")).to.equal(true);
			expect(completedAchievementNames.has("sumHit100")).to.equal(true);
		});
	});

	describe("getProgressOnAchievementForPlayer", () => {
		it("should throw if the instance is destroyed", () => {
			const playerStatisticAchievementsManager = new UnitTestablePlayerStatisticAchievementsManager();

			playerStatisticAchievementsManager.destroy();

			expect(() =>
				playerStatisticAchievementsManager.getProgressOnAchievementForPlayer(
					"incrementHit5",
					createFakePlayer(),
				),
			).to.throw();
		});

		it("should throw if statistics have not yet loaded for the player", () => {
			const playerStatisticAchievementsManager = new UnitTestablePlayerStatisticAchievementsManager();

			expect(() =>
				playerStatisticAchievementsManager.getProgressOnAchievementForPlayer(
					"incrementHit5",
					createFakePlayer(),
				),
			).to.throw();
		});

		it("should return expected values", () => {
			const [currentStatisticSnapshot, _, playerStatisticAchievementsManager, player] = runBasicSetUp();

			const incrementValues = [-1, 0, 1, 2, 3, 4, 5, 6];
			const expectedValues = [0, 0, 1 / 5, 2 / 5, 3 / 5, 4 / 5, 1, 1];
			for (let i = 0; i < incrementValues.size(); i++) {
				currentStatisticSnapshot.increment = incrementValues[i];
				const reportedProgress = playerStatisticAchievementsManager.getProgressOnAchievementForPlayer(
					"incrementHit5",
					player,
				);
				expect(reportedProgress).to.be.near(expectedValues[i]);
			}
		});
	});
};
