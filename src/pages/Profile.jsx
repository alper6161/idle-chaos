import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { INITIAL_SKILLS } from "../utils/constants.js";
import { Typography, Grid, Card, CardContent, CardActionArea, Stack } from "@mui/material";
import { 
    SportsKabaddi,
    AutoAwesome,
    Healing,
    EmojiEvents
} from "@mui/icons-material";
import { getSkillIcon } from "../utils/common.js";

const categoryIcons = {
    melee: <SportsKabaddi />,
    ranged: <EmojiEvents />,
    magic: <AutoAwesome />,
    prayer: <Healing />
};

const characterTypes = {
    melee: 'warrior',
    ranged: 'ranger',
    magic: 'wizard',
    prayer: 'cleric'
};

function Profile() {
    const navigate = useNavigate();
    const [skills, setSkills] = useState(() => {
        const saved = localStorage.getItem("gameData");
        return saved ? JSON.parse(saved) : INITIAL_SKILLS;
    });

    const handleSkillSelect = (category) => {
        const characterType = characterTypes[category];
        localStorage.setItem("selectedCharacter", characterType);
        navigate("/battle");
    };



    return (
        <div style={{ padding: "2rem" }}>
            <Typography variant="h4" gutterBottom>
                Skill Selection
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
                Choose your primary skill category to determine your character type
            </Typography>

            <Grid container spacing={3} sx={{ mt: 2 }}>
                {Object.entries(skills).filter(([category]) => characterTypes[category]).map(([category, subskills]) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={category}>
                        <Card 
                            sx={{ 
                                height: '100%',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: 4
                                }
                            }}
                        >
                            <CardActionArea 
                                onClick={() => handleSkillSelect(category)}
                                sx={{ height: '100%', p: 2 }}
                            >
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                                        {categoryIcons[category]}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                        {Object.keys(subskills).map((skillName) => (
                                            <img 
                                                key={skillName}
                                                src={getSkillIcon(skillName)} 
                                                alt={skillName}
                                                style={{ width: '24px', height: '24px' }}
                                            />
                                        ))}
                                    </div>
                                    <Typography variant="h6" gutterBottom>
                                        {category.toUpperCase()}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {Object.keys(subskills).length} skills available
                                    </Typography>
                                    
                                    {/* Skill seviyelerini göster */}
                                    <Stack spacing={1} sx={{ mt: 2 }}>
                                        {Object.entries(subskills).map(([skillName, value]) => (
                                            <div key={skillName} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="body2">
                                                    {skillName}
                                                </Typography>
                                                <Typography variant="body2" fontWeight="bold">
                                                    Lv.{value}
                                                </Typography>
                                            </div>
                                        ))}
                                    </Stack>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Grid>
                ))}
            </Grid>


        </div>
    );
}

export default Profile;
