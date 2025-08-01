"use client";

import Navbar from "~/app/_lib/components/scaffolds/navbar";
import styles from "./layout.module.css";

// Force dynamic rendering for this layout
// export const dynamic = "force-dynamic";

export default function AppLayout(props: { children: React.ReactNode }) {


  return (
    <div className={styles["app-layout"]}>
      <Navbar />
      <div className={styles.content}>{props.children}</div>
    </div>
  );
}
