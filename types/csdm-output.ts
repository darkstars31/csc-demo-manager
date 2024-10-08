export type CSDemoAnalysisOutput = {
    checksum: string
    game: string
    demoFilePath: string
    demoFileName: string
    source: string
    type: string
    mapName: string
    tickCount: number
    tickrate: number
    framerate: number
    date: string
    duration: number
    serverName: string
    clientName: string
    networkProtocol: number
    buildNumber: number
    gameType: number
    gameMode: number
    isRanked: boolean
    maxRounds: number
    overtimeCount: number
    hasVacLiveBan: boolean
    teamA: {
      name: string
      letter: string
      score: number
      scoreFirstHalf: number
      scoreSecondHalf: number
      currentSide: number
    }
    teamB: {
      name: string
      letter: string
      score: number
      scoreFirstHalf: number
      scoreSecondHalf: number
      currentSide: number
    }
    winner: {
      name: string
      letter: string
      score: number
      scoreFirstHalf: number
      scoreSecondHalf: number
      currentSide: number
    }
    players: Record<string, {
        steamId: number
        userId: number
        name: string
        score: number
        team: {
          name: string
          letter: string
          score: number
          scoreFirstHalf: number
          scoreSecondHalf: number
          currentSide: number
        }
        mvpCount: number
        rankType: number
        rank: number
        oldRank: number
        winCount: number
        crosshairShareCode: string
        color: number
        inspectWeaponCount: number
        killCount: number
        deathCount: number
        assistCount: number
        killDeathRatio: number
        kast: number
        bombDefusedCount: number
        bombPlantedCount: number
        healthDamage: number
        armorDamage: number
        utilityDamage: number
        headshotCount: number
        headshotPercent: number
        oneVsOneCount: number
        oneVsOneWonCount: number
        oneVsOneLostCount: number
        oneVsTwoCount: number
        oneVsTwoWonCount: number
        oneVsTwoLostCount: number
        oneVsThreeCount: number
        oneVsThreeWonCount: number
        oneVsThreeLostCount: number
        oneVsFourCount: number
        oneVsFourWonCount: number
        oneVsFourLostCount: number
        oneVsFiveCount: number
        oneVsFiveWonCount: number
        oneVsFiveLostCount: number
        hostageRescuedCount: number
        averageKillPerRound: number
        averageDeathPerRound: number
        averageDamagePerRound: number
        utilityDamagePerRound: number
        firstKillCount: number
        firstDeathCount: number
        firstTradeDeathCount: number
        tradeDeathCount: number
        tradeKillCount: number
        firstTradeKillCount: number
        oneKillCount: number
        twoKillCount: number
        threeKillCount: number
        fourKillCount: number
        fiveKillCount: number
        hltvRating: number
        hltvRating2: Number
    }>
    kills: Array<{
      frame: number
      tick: number
      roundNumber: number
      weaponType: string
      weaponName: string
      killerName: string
      killerSteamId: number
      killerSide: number
      killerTeamName: string
      killerX: number
      killerY: number
      killerZ: number
      is_killer_airborne: boolean
      is_killer_blinded: boolean
      isKillerControllingBot: boolean
      victimName: string
      victimSteamId: number
      victimSide: number
      victimTeamName: string
      victimX: number
      victimY: number
      victimZ: number
      is_victim_airborne: boolean
      is_victim_blinded: boolean
      isVictimControllingBot: boolean
      isVictimInspectingWeapon: boolean
      assisterName: string
      assisterSteamId: number
      assisterSide: number
      assisterTeamName: string
      assisterX: number
      assisterY: number
      assisterZ: number
      isAssisterControllingBot: boolean
      isHeadshot: boolean
      penetratedObjects: number
      isAssistedFlash: boolean
      isThroughSmoke: boolean
      isNoScope: boolean
      isTradeKill: boolean
      isTradeDeath: boolean
      distance: number
    }>
    shots: Array<{
      frame: number
      tick: number
      roundNumber: number
      weaponName: string
      weaponId: string
      projectileId: number
      x: number
      y: number
      z: number
      playerName: string
      playerSteamId: number
      playerTeamName: string
      playerSide: number
      isPlayerControllingBot: boolean
      playerVelocityX: number
      playerVelocityY: number
      playerVelocityZ: number
      yaw: number
      pitch: number
      recoilIndex: number
      aimPunchAngleX: number
      aimPunchAngleY: number
      viewPunchAngleX: number
      viewPunchAngleY: number
    }>
    rounds: Array<{
      number: number
      startTick: number
      startFrame: number
      freezeTimeEndTick: number
      freezeTimeEndFrame: number
      endTick: number
      endFrame: number
      endOfficiallyTick: number
      endOfficiallyFrame: number
      overtimeNumber: number
      teamAName: string
      teamBName: string
      teamAScore: number
      teamBScore: number
      teamASide: number
      teamBSide: number
      teamAEquipmentValue: number
      teamBEquipmentValue: number
      teamAMoneySpent: number
      teamBmoneySpent: number
      teamAEconomyType: string
      teamBEconomyType: string
      duration: number
      endReason: number
      winnerName: string
      winnerSide: number
      teamAStartMoney: number
      teamBStartMoney: number
    }>
    clutches: Array<{
      frame: number
      tick: number
      roundNumber: number
      opponentCount: number
      side: number
      hasWon: boolean
      clutcherSteamId: number
      clutcherName: string
      clutcherSurvived: boolean
      clutcherKillCount: number
    }>
    bombsPlanted: Array<{
      frame: number
      tick: number
      roundNumber: number
      site: string
      planterSteamId: number
      planterName: string
      isPlayerControllingBot: boolean
      x: number
      y: number
      z: number
    }>
    bombsDefused: Array<{
      frame: number
      tick: number
      roundNumber: number
      site: string
      defuserSteamId: number
      defuserName: string
      isPlayerControllingBot: boolean
      x: number
      y: number
      z: number
      counterTerroristAliveCount: number
      terroristAliveCount: number
    }>
    bombsExploded: Array<{
      frame: number
      tick: number
      roundNumber: number
      site: string
      defuserSteamId: number
      defuserName: string
      isPlayerControllingBot: boolean
      x: number
      y: number
      z: number
    }>
    bombsPlantStart: Array<{
      frame: number
      tick: number
      roundNumber: number
      site: string
      defuserSteamId: number
      defuserName: string
      isPlayerControllingBot: boolean
      x: number
      y: number
      z: number
    }>
    bombsDefuseStart: Array<{
      frame: number
      tick: number
      roundNumber: number
      defuserSteamId: number
      defuserName: string
      isPlayerControllingBot: boolean
      x: number
      y: number
      z: number
    }>
    playersFlashed: Array<{
      frame: number
      tick: number
      roundNumber: number
      duration: number
      flashedSteamId: number
      flashedName: string
      flashedSide: number
      isFlashedControllingBot: boolean
      flasherSteamId: number
      flasherName: string
      flasherSide: number
      isFlasherControllingBot: boolean
    }>
    grenadePositions: Array<any>
    infernoPositions: Array<any>
    hostagePickUpStart: Array<any>
    hostagePickedUp: Array<any>
    hostageRescued: Array<any>
    hostagePositions: Array<any>
    smokesStart: Array<{
      frame: number
      tick: number
      roundNumber: number
      grenadeId: string
      projectileId: number
      x: number
      y: number
      z: number
      throwerSteamId: number
      throwerName: string
      throwerSide: number
      throwerTeamName: string
      throwerVelocityX: number
      throwerVelocityY: number
      throwerVelocityZ: number
      throwerPitch: number
      throwerYaw: number
    }>
    decoysStart: Array<any>
    heGrenadesExplode: Array<{
      frame: number
      tick: number
      roundNumber: number
      grenadeId: string
      projectileId: number
      x: number
      y: number
      z: number
      throwerSteamId: number
      throwerName: string
      throwerSide: number
      throwerTeamName: string
      throwerVelocityX: number
      throwerVelocityY: number
      throwerVelocityZ: number
      throwerPitch: number
      throwerYaw: number
    }>
    flashbangsExplode: Array<{
      frame: number
      tick: number
      roundNumber: number
      grenadeId: string
      projectileId: number
      x: number
      y: number
      z: number
      throwerSteamId: number
      throwerName: string
      throwerSide: number
      throwerTeamName: string
      throwerVelocityX: number
      throwerVelocityY: number
      throwerVelocityZ: number
      throwerPitch: number
      throwerYaw: number
    }>
    grenadeBounces: Array<{
      frame: number
      tick: number
      roundNumber: number
      grenadeId: string
      projectileId: number
      grenadeName: string
      x: number
      y: number
      z: number
      throwerSteamId: number
      throwerName: string
      throwerSide: number
      throwerTeamName: string
      throwerVelocityX: number
      throwerVelocityY: number
      throwerVelocityZ: number
      throwerPitch: number
      throwerYaw: number
    }>
    grenadeProjectilesDestroy: Array<{
      frame: number
      tick: number
      roundNumber: number
      grenadeId: string
      projectileId: number
      grenadeName: string
      x: number
      y: number
      z: number
      throwerSteamId: number
      throwerName: string
      throwerSide: number
      throwerTeamName: string
      throwerVelocityX: number
      throwerVelocityY: number
      throwerVelocityZ: number
      throwerPitch: number
      throwerYaw: number
    }>
    chickenPositions: Array<any>
    chickenDeaths: Array<{
      frame: number
      tick: number
      roundNumber: number
      killerSteamId: number
      weaponName: string
    }>
    damages: Array<{
      frame: number
      tick: number
      roundNumber: number
      healthDamage: number
      armorDamage: number
      attackerSteamId: number
      attackerSide: number
      attackerTeamName: string
      isAttackerControllingBot: boolean
      victimHealth: number
      victimNewHealth: number
      victimArmor: number
      victimNewArmor: number
      victimSteamId: number
      victimSide: number
      victimTeamName: string
      isVictimControllingBot: boolean
      hitgroup: number
      weaponName: string
      weaponType: string
      weaponUniqueId: string
    }>
    playerPositions: Array<any>
    playersBuy: Array<{
      frame: number
      tick: number
      roundNumber: number
      playerSteamId: number
      playerSide: number
      playerName: string
      weaponName: string
      weaponType: string
      weaponUniqueId: string
      hasRefunded: boolean
    }>
    playerEconomies: Array<{
      roundNumber: number
      name: string
      steamId: number
      startMoney: number
      moneySpent: number
      equipmentValue: number
      type: string
      playerSide: number
    }>
    chatMessages: Array<any>
    gameModeStr: string
  }
  