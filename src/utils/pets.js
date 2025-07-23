export const PETS = {
    goblin_pet: {
        id: 'goblin_pet',
        name: 'Goblin Companion',
        enemy: 'goblin',
        dropRate: 0.0001,
        rarity: 'common',
        bonuses: {
            attack: 1,
            criticalChance: 0.5
        },
        description: 'A mischievous goblin that follows you into battle',
        icon: '🐸'
    },
    rat_pet: {
        id: 'rat_pet',
        name: 'Giant Rat Pet',
        enemy: 'rat',
        dropRate: 0.0001,
        rarity: 'common',
        bonuses: {
            attackSpeed: 2,
            dodge: 1
        },
        description: 'A surprisingly loyal giant rat companion',
        icon: '🐀'
    },
    slime_pet: {
        id: 'slime_pet',
        name: 'Slime Buddy',
        enemy: 'slime',
        dropRate: 0.0001,
        rarity: 'common',
        bonuses: {
            defense: 2,
            health: 5
        },
        description: 'A bouncy slime that absorbs some damage',
        icon: '🟢'
    },

    skeleton_pet: {
        id: 'skeleton_pet',
        name: 'Skeleton Warrior',
        enemy: 'skeleton',
        dropRate: 0.00005,
        rarity: 'uncommon',
        bonuses: {
            attack: 3,
            criticalDamage: 5,
            defense: 1
        },
        description: 'An undead warrior bound to your service',
        icon: '💀'
    },
    orc_pet: {
        id: 'orc_pet',
        name: 'Orc Berserker',
        enemy: 'orc',
        dropRate: 0.00005,
        rarity: 'uncommon',
        bonuses: {
            attack: 4,
            criticalChance: 1,
            attackSpeed: 1
        },
        description: 'A fierce orc warrior who fights alongside you',
        icon: '👹'
    },
    spider_pet: {
        id: 'spider_pet',
        name: 'Giant Spider',
        enemy: 'spider',
        dropRate: 0.00005,
        rarity: 'uncommon',
        bonuses: {
            attack: 2,
            dodge: 2,
            criticalChance: 0.5
        },
        description: 'A venomous spider that strikes with precision',
        icon: '🕷️'
    },

    troll_pet: {
        id: 'troll_pet',
        name: 'Troll Guardian',
        enemy: 'troll',
        dropRate: 0.00002,
        rarity: 'rare',
        bonuses: {
            health: 15,
            defense: 4,
            attack: 2
        },
        description: 'A massive troll that protects you in battle',
        icon: '👹'
    },
    ghost_pet: {
        id: 'ghost_pet',
        name: 'Phantom Spirit',
        enemy: 'ghost',
        dropRate: 0.00002,
        rarity: 'rare',
        bonuses: {
            dodge: 3,
            criticalChance: 1,
            attackSpeed: 1
        },
        description: 'An ethereal spirit that phases through attacks',
        icon: '👻'
    },
    dragon_pet: {
        id: 'dragon_pet',
        name: 'Dragon Hatchling',
        enemy: 'dragon',
        dropRate: 0.00002,
        rarity: 'rare',
        bonuses: {
            attack: 6,
            criticalDamage: 10,
            fireResistance: 5
        },
        description: 'A young dragon that breathes fire at your enemies',
        icon: '🐉'
    },

    bat_pet: {
        id: 'bat_pet',
        name: 'Cave Bat',
        enemy: 'bat',
        dropRate: 0.00001,
        rarity: 'epic',
        bonuses: {
            attackSpeed: 4,
            dodge: 3,
            criticalChance: 1.5
        },
        description: 'A swift bat that attacks with incredible speed',
        icon: '🦇'
    },
    wolf_pet: {
        id: 'wolf_pet',
        name: 'Dire Wolf',
        enemy: 'wolf',
        dropRate: 0.00001,
        rarity: 'epic',
        bonuses: {
            attack: 8,
            criticalChance: 2,
            attackSpeed: 2
        },
        description: 'A ferocious wolf that hunts with pack tactics',
        icon: '🐺'
    },
    zombie_pet: {
        id: 'zombie_pet',
        name: 'Undead Zombie',
        enemy: 'zombie',
        dropRate: 0.00001,
        rarity: 'epic',
        bonuses: {
            health: 20,
            defense: 5,
            lifeSteal: 2
        },
        description: 'A resilient zombie that never gives up',
        icon: '🧟'
    },

    bandit_pet: {
        id: 'bandit_pet',
        name: 'Desert Bandit',
        enemy: 'bandit',
        dropRate: 0.000005,
        rarity: 'epic',
        bonuses: {
            attack: 5,
            criticalChance: 2.5,
            dodge: 2
        },
        description: 'A cunning bandit who strikes from the shadows',
        icon: '🦹'
    },
    lizardman_pet: {
        id: 'lizardman_pet',
        name: 'Swamp Lizardman',
        enemy: 'lizardman',
        dropRate: 0.000005,
        rarity: 'epic',
        bonuses: {
            defense: 6,
            health: 10,
            poisonResistance: 5
        },
        description: 'A scaly warrior from the depths of the swamp',
        icon: '🦎'
    },
    giant_bee_pet: {
        id: 'giant_bee_pet',
        name: 'Giant Bee',
        enemy: 'giant_bee',
        dropRate: 0.000005,
        rarity: 'epic',
        bonuses: {
            attack: 4,
            attackSpeed: 3,
            criticalChance: 1
        },
        description: 'A buzzing bee that stings with deadly precision',
        icon: '🐝'
    },

    cultist_pet: {
        id: 'cultist_pet',
        name: 'Dark Cultist',
        enemy: 'cultist',
        dropRate: 0.000002,
        rarity: 'legendary',
        bonuses: {
            attack: 7,
            criticalDamage: 15,
            shadowResistance: 5
        },
        description: 'A dark cultist who channels forbidden magic',
        icon: '👤'
    },
    gargoyle_pet: {
        id: 'gargoyle_pet',
        name: 'Stone Gargoyle',
        enemy: 'gargoyle',
        dropRate: 0.000002,
        rarity: 'legendary',
        bonuses: {
            defense: 8,
            health: 25,
            earthResistance: 5
        },
        description: 'A stone guardian that protects you with ancient magic',
        icon: '🗿'
    },
    harpy_pet: {
        id: 'harpy_pet',
        name: 'Forest Harpy',
        enemy: 'harpy',
        dropRate: 0.000002,
        rarity: 'legendary',
        bonuses: {
            attack: 6,
            dodge: 4,
            attackSpeed: 2
        },
        description: 'A winged harpy that soars above the battlefield',
        icon: '🦅'
    },

    minotaur_pet: {
        id: 'minotaur_pet',
        name: 'Ancient Minotaur',
        enemy: 'minotaur',
        dropRate: 0.000001,
        rarity: 'legendary',
        bonuses: {
            attack: 12,
            defense: 6,
            health: 15,
            criticalChance: 2
        },
        description: 'An ancient minotaur warrior of legendary strength',
        icon: '🐂'
    },
    wraith_pet: {
        id: 'wraith_pet',
        name: 'Shadow Wraith',
        enemy: 'wraith',
        dropRate: 0.000001,
        rarity: 'legendary',
        bonuses: {
            attack: 8,
            dodge: 5,
            criticalDamage: 20,
            shadowResistance: 10
        },
        description: 'A spectral wraith that haunts your enemies',
        icon: '👻'
    },
    werewolf_pet: {
        id: 'werewolf_pet',
        name: 'Blood Moon Werewolf',
        enemy: 'werewolf',
        dropRate: 0.000001,
        rarity: 'legendary',
        bonuses: {
            attack: 10,
            attackSpeed: 4,
            criticalChance: 3,
            lifeSteal: 3
        },
        description: 'A savage werewolf that transforms under the blood moon',
        icon: '🐺'
    },

    golem_pet: {
        id: 'golem_pet',
        name: 'Iron Golem',
        enemy: 'golem',
        dropRate: 0.0000005,
        rarity: 'mythic',
        bonuses: {
            defense: 12,
            health: 30,
            attack: 5,
            earthResistance: 10
        },
        description: 'An indestructible iron golem forged by ancient magic',
        icon: '🤖'
    },
    vampire_pet: {
        id: 'vampire_pet',
        name: 'Ancient Vampire',
        enemy: 'vampire',
        dropRate: 0.0000005,
        rarity: 'mythic',
        bonuses: {
            attack: 15,
            lifeSteal: 5,
            criticalChance: 3,
            darkResistance: 10
        },
        description: 'An ancient vampire lord who drains life from enemies',
        icon: '🧛'
    },
    chimera_pet: {
        id: 'chimera_pet',
        name: 'Three-Headed Chimera',
        enemy: 'chimera',
        dropRate: 0.0000005,
        rarity: 'mythic',
        bonuses: {
            attack: 18,
            criticalDamage: 25,
            attackSpeed: 3,
            fireResistance: 8
        },
        description: 'A monstrous chimera with three heads and deadly breath',
        icon: '🐲'
    },

    hydra_pet: {
        id: 'hydra_pet',
        name: 'Nine-Headed Hydra',
        enemy: 'hydra',
        dropRate: 0.0000001,
        rarity: 'mythic',
        bonuses: {
            attack: 20,
            health: 40,
            criticalChance: 4,
            poisonResistance: 15
        },
        description: 'A legendary hydra with nine heads that regenerate',
        icon: '🐉'
    },
    demon_pet: {
        id: 'demon_pet',
        name: 'Infernal Demon',
        enemy: 'demon',
        dropRate: 0.0000001,
        rarity: 'mythic',
        bonuses: {
            attack: 25,
            criticalDamage: 30,
            fireResistance: 15,
            darkResistance: 15
        },
        description: 'An infernal demon from the depths of hell',
        icon: '😈'
    },
    lich_pet: {
        id: 'lich_pet',
        name: 'Death Lich',
        enemy: 'lich',
        dropRate: 0.0000001,
        rarity: 'mythic',
        bonuses: {
            attack: 22,
            criticalChance: 5,
            shadowResistance: 20,
            darkResistance: 20
        },
        description: 'An undead lich who commands the forces of death',
        icon: '💀'
    },

    manticore_pet: {
        id: 'manticore_pet',
        name: 'Winged Manticore',
        enemy: 'manticore',
        dropRate: 0.00000005,
        rarity: 'divine',
        bonuses: {
            attack: 30,
            attackSpeed: 5,
            criticalChance: 6,
            allResistance: 10
        },
        description: 'A divine manticore with deadly tail and wings',
        icon: '🦁'
    },
    ancient_dragon_pet: {
        id: 'ancient_dragon_pet',
        name: 'Ancient Dragon',
        enemy: 'ancient_dragon',
        dropRate: 0.00000005,
        rarity: 'divine',
        bonuses: {
            attack: 35,
            criticalDamage: 40,
            fireResistance: 25,
            health: 50
        },
        description: 'An ancient dragon of unimaginable power',
        icon: '🐉'
    },
    archdemon_pet: {
        id: 'archdemon_pet',
        name: 'Archdemon',
        enemy: 'archdemon',
        dropRate: 0.00000005,
        rarity: 'divine',
        bonuses: {
            attack: 40,
            criticalChance: 8,
            darkResistance: 30,
            fireResistance: 30
        },
        description: 'The ultimate demon lord of the underworld',
        icon: '👹'
    },

    void_reaper_pet: {
        id: 'void_reaper_pet',
        name: 'Void Reaper',
        enemy: 'void_reaper',
        dropRate: 0.00000001,
        rarity: 'divine',
        bonuses: {
            attack: 50,
            criticalDamage: 50,
            voidResistance: 50,
            allResistance: 20
        },
        description: 'A reaper from the void between dimensions',
        icon: '⚫'
    },
    celestial_seraph_pet: {
        id: 'celestial_seraph_pet',
        name: 'Celestial Seraph',
        enemy: 'celestial_seraph',
        dropRate: 0.00000001,
        rarity: 'divine',
        bonuses: {
            attack: 45,
            defense: 20,
            health: 60,
            lightResistance: 50,
            allResistance: 25
        },
        description: 'A divine seraph from the highest heavens',
        icon: '👼'
    }
};

export function getPetByEnemy(enemyName) {
    return Object.values(PETS).find(pet => pet.enemy === enemyName);
}

export function getPetsForEnemy(enemyName) {
    return Object.values(PETS).filter(pet => pet.enemy === enemyName);
}

export function checkPetDrop(enemyName) {
    const pet = getPetByEnemy(enemyName);
    if (!pet) return null;
    
    const random = Math.random();
    if (random < pet.dropRate) {
        return pet;
    }
    return null;
}

export function getPetBonuses(equippedPets) {
    const bonuses = {
        attack: 0,
        defense: 0,
        health: 0,
        attackSpeed: 0,
        criticalChance: 0,
        criticalDamage: 0,
        dodge: 0,
        lifeSteal: 0,
        fireResistance: 0,
        iceResistance: 0,
        lightningResistance: 0,
        poisonResistance: 0,
        shadowResistance: 0,
        darkResistance: 0,
        lightResistance: 0,
        earthResistance: 0,
        voidResistance: 0,
        allResistance: 0
    };

    if (!equippedPets || !Array.isArray(equippedPets)) return bonuses;

    equippedPets.forEach(petId => {
        const pet = PETS[petId];
        if (pet && pet.bonuses) {
            Object.keys(pet.bonuses).forEach(stat => {
                if (bonuses.hasOwnProperty(stat)) {
                    bonuses[stat] += pet.bonuses[stat];
                }
            });
        }
    });

    return bonuses;
}

export function getPetRarityColor(rarity) {
    switch (rarity) {
        case 'common': return '#ffffff';
        case 'uncommon': return '#1eff00';
        case 'rare': return '#0070dd';
        case 'epic': return '#a335ee';
        case 'legendary': return '#ff8000';
        case 'mythic': return '#ff0000';
        case 'divine': return '#ffd700';
        default: return '#ffffff';
    }
}

export function getPetRarityName(rarity) {
    switch (rarity) {
        case 'common': return 'Common';
        case 'uncommon': return 'Uncommon';
        case 'rare': return 'Rare';
        case 'epic': return 'Epic';
        case 'legendary': return 'Legendary';
        case 'mythic': return 'Mythic';
        case 'divine': return 'Divine';
        default: return 'Common';
    }
} 