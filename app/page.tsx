"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  User,
  Code2,
  FolderKanban,
  Award,
  Mail,
  Settings,
  MessageCircle,
  Cat,
  ArrowUpRight,
  Copy,
  Check,
  Moon,
  Sun,
} from "lucide-react";
import StatusBar from "@/components/StatusBar";
import Dock from "@/components/Dock";
import AppIcon from "@/components/AppIcon";
import AppSheet from "@/components/AppSheet";
import SkillBar from "@/components/SkillBar";
import ChatBot from "@/components/ChatBot";
import DejavooChat from "@/components/DejavooChat";
import CatGuide, { SearchResult } from "@/components/CatGuide";
import {
  perfil,
  habilidades,
  proyectos,
  certificaciones,
  contacto,
  wallpapers,
  appColors,
} from "@/lib/data";
import {
  getStoredWallpaper,
  setStoredWallpaper,
  getStoredDark,
  setStoredDark,
  clearStoredPreferences,
} from "@/lib/storage";

type AppKey = "sobreMi" | "habilidades" | "proyectos" | "certificaciones" | "contacto" | "ajustes" | "chat" | "dejavoo";

export default function Home() {
  const [openApp, setOpenApp] = useState<AppKey | null>(null);
  const [dark, setDark] = useState(false);
  const [wallpaperId, setWallpaperId] = useState(wallpapers[0].id);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const highlightTimeout = useRef<ReturnType<typeof setTimeout>>();

  const wallpaper = wallpapers.find((w) => w.id === wallpaperId) ?? wallpapers[0];

  // Cargar preferencias guardadas en localStorage (solo en el navegador del visitante)
  useEffect(() => {
    setWallpaperId(getStoredWallpaper(wallpapers[0].id));
    setDark(getStoredDark(false));
  }, []);

  const changeWallpaper = (id: string) => {
    setWallpaperId(id);
    setStoredWallpaper(id);
  };
  const toggleDark = () => {
    setDark((prev) => {
      const next = !prev;
      setStoredDark(next);
      return next;
    });
  };
  const resetPreferences = () => {
    clearStoredPreferences();
    setWallpaperId(wallpapers[0].id);
    setDark(false);
  };

  const focusElement = (elementId: string) => {
    setHighlighted(elementId);
    if (highlightTimeout.current) clearTimeout(highlightTimeout.current);
    setTimeout(() => {
      document.getElementById(elementId)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 150);
    highlightTimeout.current = setTimeout(() => setHighlighted(null), 1800);
  };

  const searchResults: SearchResult[] = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    const results: SearchResult[] = [];

    habilidades
      .filter((h) => h.nombre.toLowerCase().includes(q))
      .forEach((h) =>
        results.push({
          id: `skill-${h.nombre}`,
          label: h.nombre,
          sub: `Habilidad · ${h.nivel}%`,
          onSelect: () => {
            setOpenApp("habilidades");
            focusElement(`skill-${h.nombre}`);
          },
        })
      );

    proyectos
      .filter(
        (p) =>
          p.titulo.toLowerCase().includes(q) ||
          p.stack.some((s) => s.toLowerCase().includes(q))
      )
      .forEach((p) =>
        results.push({
          id: `project-${p.titulo}`,
          label: p.titulo,
          sub: `Proyecto · ${p.stack.join(", ")}`,
          onSelect: () => {
            setOpenApp("proyectos");
            focusElement(`project-${p.titulo}`);
          },
        })
      );

    const secciones: { match: string[]; key: AppKey; label: string }[] = [
      { match: ["sobre mí", "sobre mi", "objetivo", "perfil"], key: "sobreMi", label: "Sobre mí" },
      { match: ["certificacion", "bootcamp", "talento digital"], key: "certificaciones", label: "Certificaciones" },
      { match: ["contacto", "portafolio", "link", "enlace"], key: "contacto", label: "Contacto" },
      { match: ["ajustes", "fondo", "wallpaper", "modo oscuro"], key: "ajustes", label: "Ajustes" },
    ];
    secciones.forEach((s) => {
      if (s.match.some((m) => m.includes(q) || q.includes(m.split(" ")[0]))) {
        results.push({ id: `app-${s.key}`, label: s.label, sub: "Abrir app", onSelect: () => setOpenApp(s.key) });
      }
    });

    return results.slice(0, 8);
  }, [searchQuery]);

  const grid: { key: AppKey; label: string; icon: JSX.Element }[] = [
    { key: "sobreMi", label: "Sobre mí", icon: <User size={26} /> },
    { key: "habilidades", label: "Habilidades", icon: <Code2 size={26} /> },
    { key: "proyectos", label: "Proyectos", icon: <FolderKanban size={26} /> },
    { key: "certificaciones", label: "Certificados", icon: <Award size={26} /> },
    { key: "contacto", label: "Contacto", icon: <Mail size={26} /> },
    { key: "chat", label: "Pregúntale a Miu", icon: <MessageCircle size={26} /> },
    { key: "dejavoo", label: "Gato Dejavoo", icon: <Cat size={26} /> },
    { key: "ajustes", label: "Ajustes", icon: <Settings size={26} /> },
  ];

  const dockApps: AppKey[] = ["sobreMi", "habilidades", "proyectos", "contacto"];
  const dockIcons: Record<AppKey, JSX.Element> = {
    sobreMi: <User size={24} />,
    habilidades: <Code2 size={24} />,
    proyectos: <FolderKanban size={24} />,
    certificaciones: <Award size={24} />,
    contacto: <Mail size={24} />,
    ajustes: <Settings size={24} />,
    chat: <MessageCircle size={24} />,
    dejavoo: <Cat size={24} />,
  };
  const appLabels: Record<AppKey, string> = {
    sobreMi: "Sobre mí",
    habilidades: "Habilidades",
    proyectos: "Proyectos",
    certificaciones: "Certificados",
    contacto: "Contacto",
    ajustes: "Ajustes",
    chat: "Pregúntale a Miu",
    dejavoo: "Gato Dejavoo",
  };

  return (
    <main className={dark ? "dark" : ""}>
      <div
        className="h-screen w-screen relative overflow-hidden transition-colors bg-cover bg-center"
        style={{ backgroundImage: `url(${wallpaper.src})` }}
      >
        <StatusBar />

        {/* Cuadrícula de apps */}
        <div className="pt-20 px-6 grid grid-cols-4 gap-y-5 gap-x-2 justify-items-center max-w-md mx-auto">
          {grid.map((app) => (
            <AppIcon
              key={app.key}
              label={app.label}
              icon={app.icon}
              gradient={appColors[app.key]}
              onTap={() => setOpenApp(app.key)}
            />
          ))}
        </div>

        {/* Gato asistente */}
        <CatGuide searchQuery={searchQuery} onSearchChange={setSearchQuery} searchResults={searchResults} />

        <Dock
          apps={dockApps.map((k) => ({ key: k, label: appLabels[k], icon: dockIcons[k], gradient: appColors[k] }))}
          onTap={(k) => setOpenApp(k as AppKey)}
        />

        {/* --- Sheets de cada app --- */}
        {openApp === "sobreMi" && (
          <AppSheet title="Sobre mí" icon={<User size={16} />} gradient={appColors.sobreMi} onClose={() => setOpenApp(null)}>
            <h1 className="text-xl font-semibold text-ios-text dark:text-white mb-1">{perfil.nombre}</h1>
            <p className="text-ios-blue text-sm font-medium mb-4">{perfil.rol}</p>

            <h2 className="text-[12.5px] font-semibold uppercase tracking-wide text-ios-textSub dark:text-white/40 mb-1">
              Objetivo profesional
            </h2>
            <p className="text-[14px] text-ios-text dark:text-white/90 leading-relaxed mb-4">{perfil.objetivo}</p>

            <h2 className="text-[12.5px] font-semibold uppercase tracking-wide text-ios-textSub dark:text-white/40 mb-1">
              Sobre mí
            </h2>
            <p className="text-[14px] text-ios-text dark:text-white/90 leading-relaxed mb-4">{perfil.sobreMi}</p>

            <h2 className="text-[12.5px] font-semibold uppercase tracking-wide text-ios-textSub dark:text-white/40 mb-1">
              Intereses
            </h2>
            <div className="flex flex-wrap gap-2">
              {perfil.intereses.map((i) => (
                <span key={i} className="text-[12px] px-3 py-1 rounded-full bg-ios-blue/10 dark:bg-ios-blue/25 text-ios-blue">
                  {i}
                </span>
              ))}
            </div>
          </AppSheet>
        )}

        {openApp === "habilidades" && (
          <AppSheet title="Habilidades" icon={<Code2 size={16} />} gradient={appColors.habilidades} onClose={() => setOpenApp(null)}>
            {habilidades.map((h) => (
              <SkillBar key={h.nombre} nombre={h.nombre} nivel={h.nivel} highlighted={highlighted === `skill-${h.nombre}`} />
            ))}
          </AppSheet>
        )}

        {openApp === "proyectos" && (
          <AppSheet title="Proyectos" icon={<FolderKanban size={16} />} gradient={appColors.proyectos} onClose={() => setOpenApp(null)}>
            <div className="flex flex-col gap-3">
              {proyectos.map((p) => (
                <div
                  key={p.titulo}
                  id={`project-${p.titulo}`}
                  className={`rounded-2xl bg-black/[0.03] dark:bg-white/5 border border-black/5 dark:border-white/10 p-4 transition-all duration-500 ${
                    highlighted === `project-${p.titulo}` ? "ring-2 ring-ios-blue" : ""
                  }`}
                >
                  <h3 className="text-[14px] font-semibold text-ios-text dark:text-white mb-1">{p.titulo}</h3>
                  <p className="text-[12.5px] text-ios-textSub dark:text-white/60 mb-2 leading-relaxed">{p.descripcion}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {p.stack.map((s) => (
                      <span key={s} className="text-[11px] px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-ios-text dark:text-white/80">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </AppSheet>
        )}

        {openApp === "certificaciones" && (
          <AppSheet title="Certificados" icon={<Award size={16} />} gradient={appColors.certificaciones} onClose={() => setOpenApp(null)}>
            <div className="flex flex-col gap-3">
              {certificaciones.map((c) => (
                <div key={c.titulo} className="flex items-center gap-3 rounded-2xl bg-black/[0.03] dark:bg-white/5 border border-black/5 dark:border-white/10 p-3">
                  <div className="w-10 h-10 rounded-full bg-ios-yellow/20 flex items-center justify-center shrink-0">
                    <Award size={18} className="text-ios-orange" />
                  </div>
                  <div>
                    <p className="text-[13.5px] font-medium text-ios-text dark:text-white">{c.titulo}</p>
                    <p className="text-[12px] text-ios-textSub dark:text-white/60">{c.entidad}</p>
                  </div>
                </div>
              ))}
            </div>
          </AppSheet>
        )}

        {openApp === "contacto" && (
          <AppSheet title="Contacto" icon={<Mail size={16} />} gradient={appColors.contacto} onClose={() => setOpenApp(null)}>
            <p className="text-[14px] text-ios-text dark:text-white/90 mb-5 leading-relaxed">
              Estoy disponible para discutir proyectos, ideas o cualquier consulta profesional. Toda mi información de contacto está en mi portafolio.
            </p>

            {/* Botón de acceso principal, con indicador pulsante */}
            <a
              href={contacto.portafolio}
              target="_blank"
              rel="noopener noreferrer"
              className="relative flex items-center justify-between rounded-2xl bg-ios-blue text-white px-5 py-4 mb-3 active:scale-95 transition-transform shadow-icon"
            >
              <span className="flex flex-col gap-1">
                <span className="flex items-center gap-2 text-[11px] font-medium text-white/80 uppercase tracking-wide">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
                  </span>
                  Disponible ahora
                </span>
                <span className="text-[15px] font-semibold">Entrar a mi portafolio</span>
              </span>
              <ArrowUpRight size={22} />
            </a>

            {/* Copiar enlace */}
            <button
              onClick={() => {
                navigator.clipboard?.writeText(contacto.portafolio);
                setLinkCopied(true);
                setTimeout(() => setLinkCopied(false), 1800);
              }}
              className="w-full flex items-center justify-between rounded-2xl bg-black/[0.04] dark:bg-white/10 text-ios-text dark:text-white px-4 py-3 text-[13px] font-medium"
            >
              <span className="truncate text-ios-textSub dark:text-white/60">{contacto.portafolio}</span>
              {linkCopied ? (
                <span className="flex items-center gap-1 text-ios-green shrink-0">
                  <Check size={15} /> Copiado
                </span>
              ) : (
                <Copy size={15} className="shrink-0 text-ios-textSub dark:text-white/50" />
              )}
            </button>
          </AppSheet>
        )}

        {openApp === "chat" && (
          <AppSheet title="Pregúntale a Miu" icon={<MessageCircle size={16} />} gradient={appColors.chat} onClose={() => setOpenApp(null)}>
            <ChatBot />
          </AppSheet>
        )}

        {openApp === "dejavoo" && (
          <AppSheet title="Gato Dejavoo" icon={<Cat size={16} />} gradient={appColors.dejavoo} onClose={() => setOpenApp(null)}>
            <DejavooChat />
          </AppSheet>
        )}

        {openApp === "ajustes" && (
          <AppSheet title="Ajustes" icon={<Settings size={16} />} gradient={appColors.ajustes} onClose={() => setOpenApp(null)}>
            <p className="text-[12.5px] font-semibold uppercase tracking-wide text-ios-textSub dark:text-white/40 mb-2">
              Fondo de pantalla
            </p>
            <div className="flex gap-2.5 mb-6 flex-wrap">
              {wallpapers.map((w) => (
                <button
                  key={w.id}
                  title={w.nombre}
                  onClick={() => changeWallpaper(w.id)}
                  className={`w-14 h-14 rounded-2xl border-2 bg-cover bg-center transition-all ${
                    wallpaperId === w.id ? "border-ios-blue scale-105" : "border-transparent"
                  }`}
                  style={{ backgroundImage: `url(${w.src})` }}
                />
              ))}
            </div>

            <p className="text-[12.5px] font-semibold uppercase tracking-wide text-ios-textSub dark:text-white/40 mb-2">
              Apariencia
            </p>
            <button
              onClick={toggleDark}
              className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-black/[0.03] dark:bg-white/5 mb-6"
            >
              <span className="flex items-center gap-2 text-[13.5px] font-medium text-ios-text dark:text-white">
                {dark ? <Moon size={16} /> : <Sun size={16} />}
                Modo {dark ? "oscuro" : "claro"}
              </span>
              <span className={`w-11 h-6 rounded-full relative transition-colors ${dark ? "bg-ios-green" : "bg-black/20"}`}>
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all shadow ${
                    dark ? "left-5" : "left-0.5"
                  }`}
                />
              </span>
            </button>

            <p className="text-[11.5px] text-ios-textSub dark:text-white/40 mb-4 leading-relaxed">
              Tus preferencias se guardan automáticamente en este navegador (localStorage), así que se mantendrán la próxima vez que visites este portafolio.
            </p>

            <button
              onClick={resetPreferences}
              className="w-full text-center py-3 rounded-2xl bg-ios-red/10 text-ios-red text-[13.5px] font-medium"
            >
              Restablecer valores predeterminados
            </button>
          </AppSheet>
        )}
      </div>
    </main>
  );
}
