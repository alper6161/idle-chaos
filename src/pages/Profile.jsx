import { useState } from "react";
import { INITIAL_SKILLS } from "../utils/constants.js";
import { Button, Stack, Typography } from "@mui/material";
import { EmojiEvents, FitnessCenter, AutoFixHigh, Favorite } from "@mui/icons-material";
import { saveGame } from "../utils/common.js";

// İsteğe göre alt skill isimlerine ikon ataması
const skillIcons = {
    acc: <EmojiEvents />,
    str: <FitnessCenter />,
    def: <EmojiEvents />,
    hp: <Favorite />,
    energy: <AutoFixHigh />,
    default: <AutoFixHigh />
};

function Profile() {
    const [skills, setSkills] = useState(() => {
        const saved = localStorage.getItem("gameData");
        return saved ? JSON.parse(saved) : INITIAL_SKILLS;
    });

    const handleIncrement = (category, skillName) => {
        console.log(category);
        console.log(skillName);
        const updatedSkills = {
            ...skills,
            [category]: {
                ...skills[category],
                [skillName]: (skills[category][skillName] || 0) + 1
            }
        };
        setSkills(updatedSkills);
        console.log(updatedSkills);
        saveGame(updatedSkills);
    };

    return (
        <div style={{ padding: "2rem" }}>
            <Typography variant="h4" gutterBottom>
                Profil Alperen
            </Typography>

            {Object.entries(skills).map(([category, subskills]) => (
                <div key={category} style={{ marginBottom: "2rem" }}>
                    <Typography variant="h6" color="primary" gutterBottom>
                        {category.toUpperCase()}
                    </Typography>

                    <Stack spacing={1}>
                        {Object.entries(subskills).map(([skillName, value]) => (
                            <div key={skillName}>
                                <Button
                                    variant="contained"
                                    startIcon={skillIcons[skillName] || skillIcons.default}
                                    onClick={() => handleIncrement(category, skillName)}
                                >
                                    {skillName.toUpperCase()} +1
                                </Button>
                                <Typography
                                    component="span"
                                    style={{ marginLeft: "1rem", fontWeight: 500 }}
                                >
                                    {value}
                                </Typography>
                            </div>
                        ))}
                    </Stack>
                </div>
            ))}
        </div>
    );
}

export default Profile;
