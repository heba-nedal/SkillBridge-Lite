import { createContext, useContext, useState, type ReactNode } from "react";

export type Profile = {
  name: string;
  headline: string;
  about: string;
  skills: string;
  projects: string;
  experience: string;
};

export const SAMPLE_PROFILE: Profile = {
  name: "Alex Sample",
  headline: "Computer Science student (sample profile)",
  about: "This is a sample profile used for demonstration. Replace it with your own details.",
  skills: "Python, HTML, CSS, JavaScript, APIs",
  projects: "Weather dashboard using a public API; personal portfolio website",
  experience: "Teaching assistant for an introductory programming course",
};

type Ctx = {
  profile: Profile | null;
  setProfile: (p: Profile) => void;
  activeProfile: Profile;
  isSample: boolean;
};

const ProfileContext = createContext<Ctx | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  return (
    <ProfileContext.Provider
      value={{ profile, setProfile, activeProfile: profile ?? SAMPLE_PROFILE, isSample: !profile }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const c = useContext(ProfileContext);
  if (!c) throw new Error("useProfile must be used within ProfileProvider");
  return c;
}
