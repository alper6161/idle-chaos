import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../assets/styles/StartScreen.module.scss";

const skillIcons = [
  "archery", "armor", "block", "buff", "counterAttack", "critChance", "critDamage", "crush", "dodge", "doubleAttack", "energyShield", "fire", "heal", "hp", "ice", "lifeSteal", "lightning", "poison", "shadow", "slash", "stab", "throwing"
];
const characterImages = [
  { src: "/images/characters/warrior.png", alt: "Warrior", className: styles.characterWarrior },
  { src: "/images/characters/ranger.png", alt: "Ranger", className: styles.characterRanger },
  { src: "/images/characters/wizard.png", alt: "Wizard", className: styles.characterWizard }
];

// Generate random positions for left/right skill icons (fixed for each render)
const leftSkillPositions = [
  { top: '4%', left: '6%' },
  { top: '16%', left: '15%' },
  { top: '10%', left: '23%' },
  { top: '28%', left: '5%' },
  { top: '38%', left: '18%' },
  { top: '48%', left: '8%' },
  { top: '58%', left: '20%' },
  { top: '68%', left: '10%' },
  { top: '80%', left: '7%' },
  { top: '88%', left: '22%' },
  { top: '92%', left: '12%' }
];
const rightSkillPositions = [
  { top: '7%', right: '8%' },
  { top: '19%', right: '18%' },
  { top: '13%', right: '4%' },
  { top: '31%', right: '12%' },
  { top: '43%', right: '2%' },
  { top: '57%', right: '22%' },
  { top: '69%', right: '9%' },
  { top: '78%', right: '19%' },
  { top: '87%', right: '5%' },
  { top: '89%', right: '16%' },
  { top: '62%', right: '14%' }
];

function StartScreen() {
  const navigate = useNavigate();

  const handleStart = () => {
    // Try to start music on first user interaction
    const audio = document.querySelector('audio');
    if (audio) {
      audio.play().catch(() => {});
    }
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
        <img src="/IdleChaosLogo.png" alt="Idle Chaos Logo" className={styles.logoImage + ' ' + styles.logoFloat} />
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