import { Outlet, NavLink } from "react-router-dom";
import styles from "../assets/styles/MainLayout.module.scss";
import { INITIAL_SKILLS } from "../utils/constants";
import { Settings, AccountCircle } from "@mui/icons-material";
import {getSkillIcon} from "../utils/common.js";

function MainLayout() {
    return (
        <div className={styles.layout}>
            {/* Sidebar */}
            <aside className={styles.sidebar}>
                {/* Equipment Section */}
                <div className={styles.group}>
                    <div className={styles.groupTitle}>EQUIPMENT</div>
                    <NavLink
                        to="/equipment"
                        className={styles.equipmentItem}
                    >
                        <span className={styles.equipmentIcon}>⚔️</span>
                        <span className={styles.equipmentLabel}>Equipment</span>
                    </NavLink>
                </div>

                {/* Skills Sections */}
                {Object.entries(INITIAL_SKILLS).map(([category, subskills]) => (
                    <div key={category} className={styles.group}>
                        <div className={styles.groupTitle}>{category.toUpperCase()}</div>
                        {typeof subskills === "object" &&
                            Object.entries(subskills).map(([skill, level]) => (
                                <NavLink
                                    key={skill}
                                    to={`/skills/${skill}`}
                                    className={styles.skillItem}
                                >
                                    <img src={getSkillIcon(skill)} alt={skill} />
                                    <span className={styles.skillLabel}>{skill}</span>
                                    <span className={styles.skillLevel}>Lv.{level}</span>
                                </NavLink>
                            ))}
                    </div>
                ))}
            </aside>

            {/* Main Content */}
            <main className={styles.content}>
                <div className={styles.topbar}>
                    <Settings className={styles.icon} />
                    <AccountCircle className={styles.icon} />
                </div>
                <Outlet />
            </main>
        </div>
    );
}

export default MainLayout;
