import React, { useEffect, useState } from "react";
import { PETS, getPetRarityColor, getPetRarityName } from "../utils/pets.js";
import enemies from "../utils/enemies.js";
import styles from "../assets/styles/Equipment.module.scss";

// Helper function to get slot-specific key
const getSlotKey = (key, slotNumber) => `${key}_slot_${slotNumber}`;

// Get current slot number
const getCurrentSlot = () => {
    try {
        const currentSlot = localStorage.getItem('idle-chaos-current-slot');
        return currentSlot ? parseInt(currentSlot) : 1;
    } catch (error) {
        console.error('Error getting current slot:', error);
        return 1;
    }
};

function Pets() {
  const [ownedPets, setOwnedPets] = useState([]);

  useEffect(() => {
    const currentSlot = getCurrentSlot();
    const slotKey = getSlotKey('idle-chaos-pets', currentSlot);
    const pets = JSON.parse(localStorage.getItem(slotKey) || '[]');
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
                <div style={{ fontWeight: 'bold', marginBottom: 4 }}>Bonuses:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                  {Object.entries(pet.bonuses).map(([stat, value]) => (
                    <span key={stat} style={{
                      background: 'rgba(150, 206, 180, 0.2)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      border: '1px solid rgba(150, 206, 180, 0.3)',
                      fontSize: '11px'
                    }}>
                      <b>{stat}</b>: {value}
                    </span>
                  ))}
                </div>
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