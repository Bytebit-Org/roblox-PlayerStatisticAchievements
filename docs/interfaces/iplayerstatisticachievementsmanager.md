[@rbxts/player-statistic-achievements](../README.md) / IPlayerStatisticAchievementsManager

# Interface: IPlayerStatisticAchievementsManager<StatsDef, AchvmtsDef\>

Provides the interface for a player statistic achievements manager

## Type parameters

Name | Type |
:------ | :------ |
`StatsDef` | StatisticsDefinition |
`AchvmtsDef` | [*AchievementsDefinition*](../README.md#achievementsdefinition)<StatsDef\> |

## Hierarchy

* *IDestroyable*

  ↳ **IPlayerStatisticAchievementsManager**

## Implemented by

* [*PlayerStatisticAchievementsManager*](../classes/playerstatisticachievementsmanager.md)

## Table of contents

### Properties

- [achievementCompleted](iplayerstatisticachievementsmanager.md#achievementcompleted)
- [achievementRewardGranted](iplayerstatisticachievementsmanager.md#achievementrewardgranted)

### Methods

- [destroy](iplayerstatisticachievementsmanager.md#destroy)
- [getProgressOnAchievementForPlayer](iplayerstatisticachievementsmanager.md#getprogressonachievementforplayer)

## Properties

### achievementCompleted

• `Readonly` **achievementCompleted**: *IReadOnlySignal*<(`player`: *Player*, `achievementName`: keyof AchvmtsDef) => *void*\>

Fired when an achievement is completed by a player

**`argument`** player The player that completed the achievement

**`argument`** achievementName The name of the achievement that the player completed

Defined in: [src/interfaces/IPlayerStatisticAchievementsManager.d.ts:19](https://github.com/Bytebit-Org/roblox-PlayerStatisticAchievements/blob/5b14169/src/interfaces/IPlayerStatisticAchievementsManager.d.ts#L19)

___

### achievementRewardGranted

• `Readonly` **achievementRewardGranted**: *IReadOnlySignal*<(`player`: *Player*, `achievementName`: keyof AchvmtsDef, `rewards`: readonly *Reward*<string\>[]) => *void*\>

Fired when an achievement is completed by a player and their reward has finished granting

**`argument`** player The player that completed the achievement

**`argument`** achievementName The name of the achievement that the player completed

**`argument`** rewards The rewards that were granted to the player

Defined in: [src/interfaces/IPlayerStatisticAchievementsManager.d.ts:27](https://github.com/Bytebit-Org/roblox-PlayerStatisticAchievements/blob/5b14169/src/interfaces/IPlayerStatisticAchievementsManager.d.ts#L27)

## Methods

### destroy

▸ **destroy**(): *void*

Clean up everything

**Returns:** *void*

Defined in: node_modules/@rbxts/dumpster/Dumpster.d.ts:5

___

### getProgressOnAchievementForPlayer

▸ **getProgressOnAchievementForPlayer**(`achievementName`: keyof AchvmtsDef, `player`: *Player*): *number*

Gets the progress a specific player has made for a given achievement.
Progress will be returned as a number between 0 and 1, where 0 is no progress and 1 is complete.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`achievementName` | keyof AchvmtsDef | The name of the achievement to check   |
`player` | *Player* | The player    |

**Returns:** *number*

Defined in: [src/interfaces/IPlayerStatisticAchievementsManager.d.ts:37](https://github.com/Bytebit-Org/roblox-PlayerStatisticAchievements/blob/5b14169/src/interfaces/IPlayerStatisticAchievementsManager.d.ts#L37)
