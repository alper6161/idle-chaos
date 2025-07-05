export const saveGame = (game) => {
  const gameData = JSON.stringify(game);
  localStorage.setItem('gameData', gameData);
}

export const getSkillIcon = (skill) => `/images/skills/${skill}.png`;

export const getEnemyIcon = (enemy) => `/images/enemies/${enemy}.png`;