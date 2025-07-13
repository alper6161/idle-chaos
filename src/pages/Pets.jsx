import React, { useEffect, useState } from "react";
import { PETS, getPetRarityColor, getPetRarityName } from "../utils/pets.js";
import enemies from "../utils/enemies.js";
import styles from "../assets/styles/Equipment.module.scss";

function Pets() {
  const [ownedPets, setOwnedPets] = useState([]);

  useEffect(() => {
    const PETS_KEY = 'idle-chaos-pets';
    const pets = JSON.parse(localStorage.getItem(PETS_KEY) || '[]');
    setOwnedPets(pets);
  }, []);

  const allPets = Object.values(PETS);
  const totalOwned = ownedPets.length;
  const totalPets = allPets.length;

  return (
    <div className={styles.equipmentPageContainer}>
      <h2 style={{ textAlign: 'center', marginBottom: 16 }}>Pets Collection</h2>
      <div style={{ textAlign: 'center', marginBottom: 24, fontWeight: 'bold' }}>
        {totalOwned} / {totalPets} pets owned
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
        {allPets.map(pet => {
          const owned = ownedPets.includes(pet.id);
          const enemy = enemies[pet.enemy];
          return (
            <div
              key={pet.id}
              style={{
                border: `2px solid ${getPetRarityColor(pet.rarity)}`,
                borderRadius: 12,
                background: owned ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.2)',
                boxShadow: owned ? `0 0 12px 2px ${getPetRarityColor(pet.rarity)}` : 'none',
                opacity: owned ? 1 : 0.5,
                padding: 18,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative',
                minHeight: 220
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 8 }}>{pet.icon}</div>
              <div style={{
                color: getPetRarityColor(pet.rarity),
                fontWeight: 'bold',
                fontSize: 18,
                marginBottom: 4,
                textShadow: '1px 1px 2px #000'
              }}>{pet.name}</div>
              <div style={{ fontSize: 13, color: '#aaa', marginBottom: 6 }}>
                {getPetRarityName(pet.rarity)} Pet
              </div>
              <div style={{ fontSize: 13, color: '#fff', marginBottom: 6, textAlign: 'center' }}>
                {pet.description}
              </div>
              <div style={{ fontSize: 12, color: '#ffd700', marginBottom: 6 }}>
                Drops from: <b>{enemy ? enemy.name : pet.enemy}</b>
              </div>
              <div style={{ fontSize: 12, color: '#fff', marginBottom: 6 }}>
                Drop Rate: <span style={{ color: '#ff6b6b' }}>{(pet.dropRate * 100).toFixed(5)}%</span>
              </div>
              <div style={{ fontSize: 12, color: '#96ceb4', marginBottom: 6 }}>
                Bonuses:
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  {Object.entries(pet.bonuses).map(([stat, value]) => (
                    <li key={stat}>
                      <b>{stat}</b>: {value}
                    </li>
                  ))}
                </ul>
              </div>
              {owned && (
                <div style={{
                  position: 'absolute',
                  top: 8,
                  right: 12,
                  background: '#1eff00',
                  color: '#222',
                  fontWeight: 'bold',
                  fontSize: 12,
                  borderRadius: 6,
                  padding: '2px 8px',
                  boxShadow: '0 0 6px #1eff00'
                }}>
                  OWNED
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Pets; 