import { useEffect, useState } from "react";
import { auth, db } from "../../services/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

import SprintListCardWide from "../../components/sprints/SprintListCardWide";

type Sprint = {
  id: string;
  title: string;
  description: string;
  progress: number;
  status: "in-progress" | "completed";
};

type FilterTab = "all" | "in-progress" | "completed";

export default function MySprintsPage() {
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");

  useEffect(() => {
    fetchSprints();
  }, []);

  const fetchSprints = async () => {
    const user = auth.currentUser;
    if (!user) return;

    /* USER SPRINTS */
    const userSnap = await getDocs(
      query(collection(db, "user_sprints"), where("userId", "==", user.uid))
    );

    /* ALL SPRINTS */
    const sprintSnap = await getDocs(collection(db, "sprints"));

    const sprintMap: any = {};
    sprintSnap.docs.forEach((doc) => {
      sprintMap[doc.id] = doc.data();
    });

    /* MERGE */
    const merged: Sprint[] = userSnap.docs.map((doc) => {
      const d = doc.data();
      const s = sprintMap[d.sprintId];

      return {
        id: d.sprintId,
        title: s?.title || "Untitled Sprint",
        description: s?.description || "",
        progress: d.progress || 0,
        status: d.status === "completed" ? "completed" : "in-progress",
      };
    });

    setSprints(merged);
  };

  /* FILTER */
  const filtered = sprints.filter((s) => {
    if (activeFilter === "all") return true;
    return s.status === activeFilter;
  });

  /* COUNTS */
  const filterTabs = [
    { id: "all" as const, label: "All", count: sprints.length },
    {
      id: "in-progress" as const,
      label: "In Progress",
      count: sprints.filter((s) => s.status === "in-progress").length,
    },
    {
      id: "completed" as const,
      label: "Completed",
      count: sprints.filter((s) => s.status === "completed").length,
    },
  ];

  return (
    <div className="mysprints-page">

      {/* HEADER */}
      <div className="mysprints-header">
        <h1>My Sprints</h1>
        <p>Track and manage your learning sprints.</p>
      </div>

      {/* TABS */}
    <div className="mysprints-tabs">
      {filterTabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveFilter(tab.id)}
          className={`tab-btn tab-${tab.id} ${
            activeFilter === tab.id ? "active" : ""
          }`}
        >
          <span>{tab.label}</span>
          <span className="count">({tab.count})</span>
        </button>
      ))}
    </div>

      {/* LIST */}
      <div className="mysprints-list">
        {filtered.length > 0 ? (
          filtered.map((s) => (
            <SprintListCardWide key={s.id} sprint={s} />
          ))
        ) : (
          <div className="mysprints-empty">
            <p>No sprints found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}