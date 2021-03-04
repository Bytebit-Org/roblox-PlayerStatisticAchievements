[@rbxts/player-statistic-achievements](../README.md) / PlayerStatisticAchievementsManager

# Class: PlayerStatisticAchievementsManager<StatsDef, AchvmtsDef\>

The standard player statistic achievements manager.
This manager will handle listening for statistics to load for each player and cleaning up when players leave.
Its main purpose, though, is to listen for each player to complete an achievement and then grant them the associated rewards.

## Type parameters

Name | Type |
:------ | :------ |
`StatsDef` | StatisticsDefinition |
`AchvmtsDef` | [*AchievementsDefinition*](../README.md#achievementsdefinition)<StatsDef\> |

## Implements

* [*IPlayerStatisticAchievementsManager*](../interfaces/iplayerstatisticachievementsmanager.md)<StatsDef, AchvmtsDef\>

## Table of contents

### Properties

- [achievementCompleted](playerstatisticachievementsmanager.md#achievementcompleted)
- [achievementRewardGranted](playerstatisticachievementsmanager.md#achievementrewardgranted)

### Methods

- [destroy](playerstatisticachievementsmanager.md#destroy)
- [getProgressOnAchievementForPlayer](playerstatisticachievementsmanager.md#getprogressonachievementforplayer)
- [create](playerstatisticachievementsmanager.md#create)

## Properties

### achievementCompleted

• `Readonly` **achievementCompleted**: *ISignal*<(`player`: *Player*, `achievementName`: keyof AchvmtsDef) => *void*\>

Fired when an achievement is completed by a player

Implementation of: [IPlayerStatisticAchievementsManager](../interfaces/iplayerstatisticachievementsmanager.md).[achievementCompleted](../interfaces/iplayerstatisticachievementsmanager.md#achievementcompleted)

Defined in: [src/classes/PlayerStatisticAchievementsManager.ts:35](https://github.com/Bytebit-Org/roblox-PlayerStatisticAchievements/blob/5b14169/src/classes/PlayerStatisticAchievementsManager.ts#L35)

___

### achievementRewardGranted

• `Readonly` **achievementRewardGranted**: *ISignal*<(`player`: *Player*, `achievementName`: keyof AchvmtsDef, `rewards`: readonly *Reward*<string\>[]) => *void*\>

Fired when an achievement is completed by a player and their reward has finished granting

Implementation of: [IPlayerStatisticAchievementsManager](../interfaces/iplayerstatisticachievementsmanager.md).[achievementRewardGranted](../interfaces/iplayerstatisticachievementsmanager.md#achievementrewardgranted)

Defined in: [src/classes/PlayerStatisticAchievementsManager.ts:36](https://github.com/Bytebit-Org/roblox-PlayerStatisticAchievements/blob/5b14169/src/classes/PlayerStatisticAchievementsManager.ts#L36)

## Methods

### destroy

▸ **destroy**(): *void*

Clean up everything

**Returns:** *void*

Implementation of: [IPlayerStatisticAchievementsManager](../interfaces/iplayerstatisticachievementsmanager.md)

Defined in: [src/classes/PlayerStatisticAchievementsManager.ts:102](https://github.com/Bytebit-Org/roblox-PlayerStatisticAchievements/blob/5b14169/src/classes/PlayerStatisticAchievementsManager.ts#L102)

___

### getProgressOnAchievementForPlayer

▸ **getProgressOnAchievementForPlayer**(`achievementName`: keyof AchvmtsDef, `player`: *Player*): *number*

#### Parameters:

Name | Type |
:------ | :------ |
`achievementName` | keyof AchvmtsDef |
`player` | *Player* |

**Returns:** *number*

Defined in: [src/classes/PlayerStatisticAchievementsManager.ts:112](https://github.com/Bytebit-Org/roblox-PlayerStatisticAchievements/blob/5b14169/src/classes/PlayerStatisticAchievementsManager.ts#L112)

___

### create

▸ `Static`**create**<StatsDef, AchvmtsDef\>(`achievementsDefinition`: AchvmtsDef, `rewardGrantersByRewardType`: *ReadonlyMap*<string, IRewardGranter\>, `playerStatisticsReader`: *IPlayerStatisticsReader*<StatsDef\>): [*IPlayerStatisticAchievementsManager*](../interfaces/iplayerstatisticachievementsmanager.md)<StatsDef, AchvmtsDef\>

Creates a new instance

#### Type parameters:

Name | Type |
:------ | :------ |
`StatsDef` | StatisticsDefinition |
`AchvmtsDef` | [*AchievementsDefinition*](../README.md#achievementsdefinition)<StatsDef\> |

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`achievementsDefinition` | AchvmtsDef | The definition of achievements.   |
`rewardGrantersByRewardType` | *ReadonlyMap*<string, IRewardGranter\> | The reward granters keyed by the reward type they grant.   |
`playerStatisticsReader` | *IPlayerStatisticsReader*<StatsDef\> | The player statistics reader to use for listening to statistics updates and monitoring for completed achievements.    |

**Returns:** [*IPlayerStatisticAchievementsManager*](../interfaces/iplayerstatisticachievementsmanager.md)<StatsDef, AchvmtsDef\>

Defined in: [src/classes/PlayerStatisticAchievementsManager.ts:85](https://github.com/Bytebit-Org/roblox-PlayerStatisticAchievements/blob/5b14169/src/classes/PlayerStatisticAchievementsManager.ts#L85)
