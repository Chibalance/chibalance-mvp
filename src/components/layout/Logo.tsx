import "../../styles/logo.css";
import { GraduationCap } from "lucide-react";

export default function Logo() {
  return (
    <div className="logo-container">
      
      {/* Icon */}
      <div className="logo-icon">
        <GraduationCap className="logo-icon-svg" />
      </div>

      {/* Text */}
      <div>
        <h1 className="logo-title">Skill Sprint</h1>
        <p className="logo-subtitle">Chi Balance</p>
      </div>

    </div>
  );
}