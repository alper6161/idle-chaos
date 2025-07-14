import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "../assets/styles/StartScreen.module.scss";

const skillIcons = [
  "archery", "armor", "block", "buff", "counterAttack", "critChance", "critDamage", "crush", "dodge", "doubleAttack", "energy", "fire", "heal", "hp", "ice", "lifeSteal", "lightning", "poison", "shadow", "slash", "stab", "throwing"
];
const characterImages = [
  { src: "/images/characters/warrior.png", alt: "Warrior", className: styles.characterWarrior },
  { src: "/images/characters/ranger.png", alt: "Ranger", className: styles.characterRanger },
  { src: "/images/characters/wizard.png", alt: "Wizard", className: styles.characterWizard }
];

// Generate random positions for left/right skill icons (fixed for each render)
const leftSkillPositions = [
  { top: '6%', left: '8%' },
  { top: '18%', left: '13%' },
  { top: '11%', left: '19%' },
  { top: '29%', left: '7%' },
  { top: '37%', left: '15%' },
  { top: '46%', left: '10%' },
  { top: '54%', left: '18%' },
  { top: '63%', left: '12%' },
  { top: '77%', left: '9%' },
  { top: '85%', left: '21%' },
  { top: '92%', left: '14%' }
];
const rightSkillPositions = [
  { top: '9%', right: '10%' },
  { top: '21%', right: '17%' },
  { top: '15%', right: '8%' },
  { top: '33%', right: '13%' },
  { top: '41%', right: '6%' },
  { top: '53%', right: '20%' },
  { top: '66%', right: '11%' },
  { top: '74%', right: '18%' },
  { top: '83%', right: '7%' },
  { top: '91%', right: '15%' },
  { top: '59%', right: '13%' }
];

function StartScreen() {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate("/home");
  };

  // Split skill icons for left/right
  const leftIcons = skillIcons.slice(0, leftSkillPositions.length);
  const rightIcons = skillIcons.slice(leftSkillPositions.length);

  return (
    <div className={styles.startScreenContainer}>
      {/* Left scattered skill icons */}
      {leftIcons.map((icon, i) => (
        <img
          key={"left-" + icon}
          src={`/images/skills/${icon}.png`}
          alt={icon}
          className={styles.skillScatterIcon}
          style={{ ...leftSkillPositions[i], position: 'absolute', zIndex: 3, animationDelay: `${i * 0.13}s` }}
        />
      ))}
      {/* Right scattered skill icons */}
      {rightIcons.map((icon, i) => (
        <img
          key={"right-" + icon}
          src={`/images/skills/${icon}.png`}
          alt={icon}
          className={styles.skillScatterIcon}
          style={{ ...rightSkillPositions[i], position: 'absolute', zIndex: 3, animationDelay: `${i * 0.13}s` }}
        />
      ))}
      <div className={styles.logoArea}>
        <h1 className={styles.title}>IDLE CHAOS</h1>
        <div className={styles.charactersRow}>
          {characterImages.map((char, i) => (
            <img
              key={char.alt}
              src={char.src}
              alt={char.alt}
              className={char.className}
              style={{ animationDelay: `${i * 0.3}s` }}
            />
          ))}
        </div>
      </div>
      <button className={styles.startButton} onClick={handleStart}>
        PRESS TO START
      </button>
      <div className={styles.credit}>© 2025 Idle Chaos</div>
    </div>
  );
}

export default StartScreen; 