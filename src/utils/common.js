export const saveGame = (game) => {
  const gameData = JSON.stringify(game);
  localStorage.setItem('gameData', gameData);
}