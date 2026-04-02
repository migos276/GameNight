import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useEventsStore } from '../store/eventsStore';
import { useAuthStore } from '../store/authStore';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';

/* ─────────────────────────────────────────
   GLOBAL STYLES  — injected once via <style>
───────────────────────────────────────── */
  const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=JetBrains+Mono:wght@400;600;700&display=swap');

  .gn-page :root {
    --bg:          #0a0e27;
    --surface:     #141829;
    --surface2:    #1a1f3a;
    --border:      rgba(0,255,255,0.15);
    --border2:     rgba(0,255,255,0.25);
    --text:        #e0f7ff;
    --sub:         #a8c5ff;
    --muted:       #6b8cdc;
    --accent:      #00ffff;
    --accent2:     #ff006e;
    --accent3:     #00d9ff;
    --glow:        0 0 20px rgba(0,255,255,0.5);
    --glow-pink:   0 0 20px rgba(255,0,110,0.5);
    --radius-card: 8px;
    --font-display:'Orbitron', sans-serif;
    --font-body:   'JetBrains Mono', monospace;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* ── page root ── */
  .gn-page {
    background:
      linear-gradient(180deg, 
        rgba(10,14,39,0.95) 0%,
        rgba(20,24,41,0.90) 50%,
        rgba(10,14,39,0.95) 100%),
      radial-gradient(ellipse at 20% 50%, rgba(0,255,255,0.05) 0%, transparent 50%),
      url(/3.jpeg);
    background-size: cover;
    background-position: center;
    background-attachment: fixed;
    min-height: 100vh;
    color: var(--text);
    font-family: var(--font-body);
    overflow-x: hidden;
    position: relative;
  }
  
  .gn-page::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      linear-gradient(90deg, transparent 0%, rgba(0,255,255,0.02) 50%, transparent 100%);
    pointer-events: none;
    animation: flicker 0.15s infinite;
    z-index: 0;
  }
  
  @keyframes flicker {
    0% { opacity: 0.97; }
    50% { opacity: 1; }
    100% { opacity: 0.97; }
  }

  /* ────────────────────────────────────
     HERO
  ──────────────────────────────────── */
  .gn-hero {
    position: relative;
    text-align: center;
    padding: 100px 24px 90px;
    overflow: hidden;
    z-index: 1;
  }

  .gn-hero::before {
    content: '';
    position: absolute;
    top: 0; left: 50%;
    transform: translateX(-50%);
    width: 700px; height: 420px;
    border-radius: 50%;
    background: radial-gradient(ellipse at center,
      rgba(0,255,255,0.25) 0%,
      rgba(0,217,255,0.12) 40%,
      transparent 70%);
    pointer-events: none;
    filter: blur(40px);
    animation: pulseGlow 4s ease-in-out infinite;
  }
  
  @keyframes pulseGlow {
    0%, 100% { opacity: 0.8; transform: translateX(-50%) scale(1); }
    50% { opacity: 1; transform: translateX(-50%) scale(1.05); }
  }

  .gn-hero-title {
    font-family: var(--font-display);
    font-size: clamp(52px, 9vw, 96px);
    line-height: 1.0;
    letter-spacing: 2px;
    color: var(--text);
    max-width: 720px;
    margin: 0 auto 24px;
    position: relative;
    text-transform: uppercase;
    font-weight: 900;
    text-shadow: 0 0 30px rgba(0,255,255,0.3), 0 0 60px rgba(0,217,255,0.2);
  }

  .gn-hero-title em {
    font-style: normal;
    color: var(--accent2);
    text-shadow: 0 0 20px rgba(255,0,110,0.6), 0 0 40px rgba(255,0,110,0.3);
  }

  .gn-hero-sub {
    font-size: 15px;
    line-height: 1.75;
    color: var(--sub);
    max-width: 400px;
    margin: 0 auto 40px;
    font-weight: 300;
  }

  .gn-hero-btns {
    display: flex;
    gap: 12px;
    justify-content: center;
    flex-wrap: wrap;
    position: relative;
  }

  .btn-gold {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: linear-gradient(135deg, var(--accent), var(--accent3));
    color: var(--bg);
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 15px;
    padding: 14px 28px;
    border-radius: 4px;
    text-decoration: none;
    text-transform: uppercase;
    letter-spacing: 1px;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    border: 2px solid var(--accent);
    box-shadow: 0 0 15px rgba(0,255,255,0.3), inset 0 0 15px rgba(0,255,255,0.1);
    position: relative;
    overflow: hidden;
  }
  
  .btn-gold::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
    transition: left 0.5s;
  }
  
  .btn-gold:hover {
    transform: translateY(-3px) scaleX(1.05);
    box-shadow: 0 0 30px rgba(0,255,255,0.6), inset 0 0 15px rgba(0,255,255,0.2);
  }
  
  .btn-gold:hover::before {
    left: 100%;
  }

  .btn-gold .plus-icon {
    width: 22px; height: 22px;
    background: rgba(255,255,255,0.2);
    border-radius: 2px;
    display: inline-flex; align-items: center; justify-content: center;
    font-size: 18px; font-weight: 400; line-height: 1;
  }

  .btn-dark {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: transparent;
    border: 2px solid var(--accent);
    color: var(--accent);
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 15px;
    padding: 14px 28px;
    border-radius: 4px;
    text-decoration: none;
    text-transform: uppercase;
    letter-spacing: 1px;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .btn-dark:hover { 
    background: rgba(0,255,255,0.1);
    transform: translateY(-3px);
    box-shadow: 0 0 25px rgba(0,255,255,0.4);
  }

  /* ────────────────────────────────────
     SECTION — LE LOBBY
  ──────────────────────────────────── */
  .gn-lobby {
    max-width: 1120px;
    margin: 0 auto;
    padding: 0 32px 80px;
  }

  .gn-lobby-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 28px;
  }

  .gn-lobby-eyebrow {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--muted);
    display: block;
    margin-bottom: 6px;
    font-family: var(--font-body);
  }

  .gn-lobby-title {
    font-family: var(--font-display);
    font-size: 36px;
    color: var(--text);
    letter-spacing: 1px;
    text-transform: uppercase;
    font-weight: 900;
    text-shadow: 0 0 20px rgba(0,255,255,0.3);
  }

  .gn-see-all {
    font-size: 13px;
    font-weight: 600;
    color: var(--sub);
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 4px;
    padding-bottom: 2px;
    border-bottom: 1px solid rgba(255,255,255,0.15);
    transition: color 0.15s, border-color 0.15s;
  }
  .gn-see-all:hover { color: var(--text); border-color: rgba(255,255,255,0.4); }

  /* ────────────────────────────────────
     CARD GRID
  ──────────────────────────────────── */
  .gn-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 18px;
  }

  /* ────────────────────────────────────
     EVENT CARD
  ──────────────────────────────────── */
  .gn-card {
    background: linear-gradient(135deg, rgba(20,24,41,0.8), rgba(26,31,58,0.6));
    border: 2px solid var(--border);
    border-radius: var(--radius-card);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    text-decoration: none;
    color: var(--text);
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
                box-shadow 0.3s,
                border-color 0.3s;
    position: relative;
    backdrop-filter: blur(10px);
    cursor: pointer;
    border: 2px solid var(--border);
    border-radius: var(--radius-card);
    outline: none;
  }

  .gn-card:focus-visible {
    box-shadow: 0 0 0 3px rgba(0,255,255,0.6);
  }
  
  .gn-card::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, 
      rgba(0,255,255,0) 0%, 
      rgba(0,255,255,0.05) 50%, 
      rgba(255,0,110,0) 100%);
    pointer-events: none;
    border-radius: var(--radius-card);
  }
  
  .gn-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 0 40px rgba(0,255,255,0.4), 0 15px 40px rgba(0,0,0,0.7);
    border-color: var(--accent);
  }

  .gn-card-thumb {
    position: relative;
    height: 172px;
    background: #1a1a1a;
    overflow: hidden;
    flex-shrink: 0;
  }
  .gn-card-thumb img {
    width: 100%; height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.4s ease;
  }
  .gn-card:hover .gn-card-thumb img { transform: scale(1.05); }

  .gn-card-thumb-placeholder {
    width: 100%; height: 100%;
    display: flex; align-items: center; justify-content: center;
    font-size: 48px;
    background: linear-gradient(135deg, #1e1e1e, #141414);
  }

  .gn-badge {
    position: absolute;
    top: 10px;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: 6px 12px;
    border-radius: 2px;
    font-family: var(--font-body);
    border: 1px solid currentColor;
  }
  .gn-badge-popular  { 
    left: 10px;  
    background: rgba(0,255,255,0.15);
    color: var(--accent);
    border-color: var(--accent);
    box-shadow: 0 0 15px rgba(0,255,255,0.3);
  }
  .gn-badge-status   { right: 10px; }
  .gn-badge-confirmed{ 
    background: rgba(0,255,100,0.15);
    color: #00ff64;
    border-color: #00ff64;
    box-shadow: 0 0 10px rgba(0,255,100,0.3);
  }
  .gn-badge-planned  { 
    background: rgba(0,150,255,0.15);
    color: #0096ff;
    border-color: #0096ff;
    box-shadow: 0 0 10px rgba(0,150,255,0.3);
  }
  .gn-badge-cancelled{ 
    background: rgba(255,50,50,0.15);
    color: #ff3232;
    border-color: #ff3232;
    box-shadow: 0 0 10px rgba(255,50,50,0.3);
  }
  .gn-badge-default  { 
    background: rgba(100,100,200,0.15);
    color: #6464c8;
    border-color: #6464c8;
  }

  .gn-card-body {
    padding: 18px 18px 14px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    flex: 1;
  }

  .gn-card-title {
    font-family: var(--font-display);
    font-size: 17px;
    font-weight: 700;
    line-height: 1.3;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .gn-card-meta { display: flex; flex-direction: column; gap: 5px; }

  .gn-card-meta-row {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 13px;
    color: var(--sub);
    font-weight: 400;
  }
  .gn-card-meta-row .icon { font-size: 13px; opacity: 0.8; }

  .gn-card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 12px;
    border-top: 1px solid var(--border);
    margin-top: auto;
  }

  .gn-avatars { display: flex; align-items: center; }
  .gn-avatar {
    width: 28px; height: 28px;
    border-radius: 50%;
    border: 2px solid var(--surface);
    background: #2e2e3a;
    color: #c0c0d0;
    font-size: 10px;
    font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    overflow: hidden;
    margin-left: -7px;
    flex-shrink: 0;
  }
  .gn-avatars .gn-avatar:first-child { margin-left: 0; }
  .gn-avatar img { width: 100%; height: 100%; object-fit: cover; }
  .gn-avatar-overflow { background: #3a3a4a; font-size: 9px; }

  .gn-player-count {
    font-size: 13px;
    color: var(--sub);
    font-weight: 400;
  }
  .gn-player-count strong { color: var(--text); font-weight: 600; }

  .gn-detail-layer {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 30;
  }

  .gn-detail-backdrop {
    position: absolute;
    inset: 0;
    background: rgba(5, 9, 26, 0.85);
    backdrop-filter: blur(6px);
  }

  .gn-detail-panel {
    position: relative;
    width: min(640px, calc(100% - 40px));
    background: rgba(20, 24, 41, 0.95);
    border-radius: 24px;
    border: 1px solid var(--border2);
    box-shadow: 0 25px 80px rgba(0, 0, 0, 0.55);
    overflow: hidden;
    z-index: 1;
    display: flex;
    flex-direction: column;
  }

  .gn-detail-close {
    position: absolute;
    top: 12px;
    right: 12px;
    width: 32px;
    height: 32px;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.35);
    background: rgba(255, 255, 255, 0.05);
    color: var(--text);
    font-size: 18px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .gn-detail-thumb {
    position: relative;
    height: 220px;
    background: #111;
    overflow: hidden;
  }

  .gn-detail-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .gn-detail-body {
    padding: 32px 36px 32px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .gn-detail-venue {
    font-size: 12px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--sub);
  }

  .gn-detail-date {
    font-size: 14px;
    color: var(--text);
  }

  .gn-detail-copy {
    color: var(--text);
    line-height: 1.6;
    font-size: 14px;
  }

  .gn-detail-meta {
    display: flex;
    gap: 24px;
    flex-wrap: wrap;
    font-size: 13px;
    color: var(--sub);
  }

  .gn-detail-meta-label {
    display: block;
    font-size: 10px;
    letter-spacing: 0.3em;
    margin-bottom: 4px;
    color: var(--text);
    text-transform: uppercase;
  }

  .gn-detail-members {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    font-size: 13px;
    color: var(--sub);
  }

  .gn-detail-members span {
    padding: 6px 10px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.03);
  }

  .gn-detail-full {
    font-size: 12px;
    color: rgba(255, 0, 110, 0.85);
    margin-top: 8px;
  }

  .gn-detail-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  .gn-detail-panel .btn-dark {
    border-color: rgba(255, 255, 255, 0.25);
    color: var(--text);
    background: rgba(255, 255, 255, 0.04);
  }

  /* ────────────────────────────────────
     EMPTY STATE
  ──────────────────────────────────── */
  .gn-empty {
    grid-column: 1 / -1;
    text-align: center;
    padding: 72px 24px;
    background: var(--surface);
    border: 1px dashed rgba(255,255,255,0.1);
    border-radius: var(--radius-card);
    color: var(--muted);
  }
  .gn-empty p { font-size: 15px; line-height: 1.6; margin-top: 12px; }

  /* ────────────────────────────────────
     CTA BANNER
  ──────────────────────────────────── */
  .gn-cta-wrap {
    max-width: 1120px;
    margin: 0 auto;
    padding: 0 32px 100px;
    position: relative;
    z-index: 1;
  }

  .gn-cta-inner {
    border-radius: 8px;
    background: linear-gradient(135deg, 
      rgba(0,255,255,0.08) 0%, 
      rgba(255,0,110,0.08) 50%,
      rgba(0,217,255,0.08) 100%);
    border: 2px solid;
    border-image: linear-gradient(135deg, var(--accent), var(--accent2), var(--accent3)) 1;
    padding: 60px 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 48px;
    flex-wrap: wrap;
    position: relative;
    overflow: hidden;
    backdrop-filter: blur(10px);
  }

  .gn-cta-inner::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: 
      linear-gradient(90deg, transparent 0%, rgba(0,255,255,0.03) 50%, transparent 100%);
    pointer-events: none;
    animation: scan 3s linear infinite;
  }

  @keyframes scan {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(100%); }
  }

  .gn-cta-inner::after {
    content: '';
    position: absolute; 
    inset: 0;
    background-image: radial-gradient(circle, rgba(0,255,255,0.05) 1px, transparent 1px);
    background-size: 28px 28px;
    pointer-events: none;
  }

  .gn-cta-text { max-width: 380px; position: relative; z-index: 1; }

  .gn-cta-text h2 {
    font-family: var(--font-display);
    font-size: clamp(30px, 4vw, 44px);
    line-height: 1.0;
    letter-spacing: 1px;
    margin-bottom: 14px;
    text-transform: uppercase;
    text-shadow: 0 0 20px rgba(0,255,255,0.3);
  }

  .gn-cta-text p {
    font-size: 14px;
    line-height: 1.75;
    color: var(--sub);
    font-weight: 400;
    margin-bottom: 28px;
  }

  .btn-cta-white {
    display: inline-flex;
    align-items: center;
    background: linear-gradient(135deg, var(--accent), var(--accent3));
    color: var(--bg);
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 14px;
    padding: 13px 26px;
    border-radius: 4px;
    text-decoration: none;
    text-transform: uppercase;
    letter-spacing: 1px;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow: 0 0 20px rgba(0,255,255,0.4);
    border: 2px solid var(--accent);
    position: relative;
    overflow: hidden;
  }
  
  .btn-cta-white::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
    transition: left 0.5s;
  }
  
  .btn-cta-white:hover { 
    transform: translateY(-3px);
    box-shadow: 0 0 40px rgba(0,255,255,0.6);
  }
  
  .btn-cta-white:hover::before {
    left: 100%;
  }

  .gn-cta-icons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    flex-shrink: 0;
    position: relative;
    z-index: 1;
  }

  .gn-cta-icon {
    width: 82px; height: 82px;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 32px;
    background: linear-gradient(135deg, rgba(0,255,255,0.1), rgba(255,0,110,0.1));
    border: 2px solid rgba(0,255,255,0.3);
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    cursor: default;
  }
  .gn-cta-icon:hover { 
    transform: scale(1.1);
    background: linear-gradient(135deg, rgba(0,255,255,0.2), rgba(255,0,110,0.2));
    border-color: var(--accent);
    box-shadow: 0 0 20px rgba(0,255,255,0.4);
  }
  .gn-cta-icon.dim { 
    background: linear-gradient(135deg, rgba(0,255,255,0.05), rgba(255,0,110,0.05));
    border-color: rgba(0,255,255,0.15);
  }

  /* ────────────────────────────────────
     VISITOR (logged out) HERO
  ──────────────────────────────────── */
  .gn-visitor {
    min-height: 100vh;
    display: flex; align-items: center; justify-content: center;
    background: var(--bg);
    position: relative; overflow: hidden;
    font-family: var(--font-body);
  }
  .gn-visitor-bg {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(10,14,39,0.75), rgba(10,14,39,0.90)),
      url(/deux-joueurs.webp);
    background-size: cover;
    background-position: center;
  }
  
  .gn-visitor-bg::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at 50% 50%,
      rgba(0,255,255,0.1) 0%,
      rgba(255,0,110,0.05) 50%,
      transparent 100%);
  }
  
  .gn-visitor-content {
    position: relative; z-index: 1;
    text-align: center;
    max-width: 680px;
    padding: 0 24px;
    color: var(--text);
  }
  .gn-visitor-content h1 {
    font-family: var(--font-display);
    font-size: clamp(48px, 9vw, 86px);
    line-height: 1.0;
    letter-spacing: 2px;
    margin-bottom: 20px;
    text-transform: uppercase;
    font-weight: 900;
    text-shadow: 0 0 40px rgba(0,255,255,0.4), 0 0 80px rgba(0,217,255,0.2);
  }
  .gn-visitor-content h1 em {
    font-style: normal;
    color: var(--accent2);
    text-shadow: 0 0 30px rgba(255,0,110,0.6), 0 0 60px rgba(255,0,110,0.3);
  }
  .gn-visitor-content p {
    font-size: 16px; 
    line-height: 1.7;
    color: var(--sub);
    margin-bottom: 40px;
    font-weight: 400;
  }
  .gn-visitor-btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

  /* ────────────────────────────────────
     RESPONSIVE
  ──────────────────────────────────── */
  @media (max-width: 640px) {
    .gn-hero { padding: 80px 20px 70px; }
    .gn-lobby, .gn-cta-wrap { padding-left: 20px; padding-right: 20px; }
    .gn-cta-inner { padding: 40px 28px; }
    .gn-lobby-header { flex-direction: column; align-items: flex-start; gap: 12px; }
    .gn-cta-icons { display: none; }
  }
`;

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */
const formatDate = (dateString: string) => {
  try {
    const d = new Date(dateString);
    const day = d.toLocaleDateString('fr-FR', { weekday: 'long' });
    const time = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    return `${day.charAt(0).toUpperCase() + day.slice(1)}, ${time}`;
  } catch {
    return 'Date à venir';
  }
};

const getMembersCount = (event: any): number => {
  if (Array.isArray(event.members) && event.members.length > 0) return event.members.length;
  if (event._count?.members) return event._count.members;
  return 0;
};

const statusMap: Record<string, { label: string; cls: string }> = {
  CONFIRMED: { label: 'Confirmed', cls: 'gn-badge-confirmed' },
  PLANNED:   { label: 'Planned',   cls: 'gn-badge-planned'   },
  CANCELLED: { label: 'Cancelled', cls: 'gn-badge-cancelled' },
};

const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:3000/api';
const BACKEND_ORIGIN = (() => {
  try {
    return new URL(API_BASE_URL).origin;
  } catch {
    return API_BASE_URL.replace(/\/api\/?$/, '') || 'http://localhost:3000';
  }
})();

const resolveEventImageUrl = (imageUrl?: string) => {
  if (!imageUrl) return undefined;
  if (/^https?:\/\//.test(imageUrl)) return imageUrl;
  return `${BACKEND_ORIGIN}${imageUrl}`;
};

/* ─────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────── */
const VisitorHero: React.FC = () => (
  <div className="gn-visitor">
    <div className="gn-visitor-bg" />
    <div className="gn-visitor-content">
      <h1>Level Up Your <em>Game Nights</em></h1>
      <p>Organize sessions, vote for games,<br />and track your victories.</p>
      <div className="gn-visitor-btns">
        <Link to="/login"    className="btn-gold">Sign In</Link>
        <Link to="/register" className="btn-dark">Register</Link>
      </div>
    </div>
  </div>
);

const EventCard: React.FC<{ event: any; onSelect?: (event: any) => void }> = ({ event, onSelect }) => {
  const count = getMembersCount(event);
  const status = event.status
    ? (statusMap[event.status] ?? { label: event.status, cls: 'gn-badge-default' })
    : null;
  const members: any[] = Array.isArray(event.members) ? event.members : [];
  const imageSrc = resolveEventImageUrl(event.imageUrl);
  const handleSelect = () => {
    if (onSelect) onSelect(event);
  };

  return (
    <button type="button" className="gn-card" onClick={handleSelect}>
      <div className="gn-card-thumb">
        {imageSrc
          ? <img src={imageSrc} alt={event.title} />
          : <div className="gn-card-thumb-placeholder">🎲</div>
        }
        {event.isPopular && <span className="gn-badge gn-badge-popular">Populaire</span>}
        {status && <span className={`gn-badge gn-badge-status ${status.cls}`}>{status.label}</span>}
      </div>

      <div className="gn-card-body">
        <h3 className="gn-card-title">{event.title}</h3>

        <div className="gn-card-meta">
          <div className="gn-card-meta-row">
            <span className="icon">📅</span>
            <span>{formatDate(event.date)}</span>
          </div>
          {event.location && (
            <div className="gn-card-meta-row">
              <span className="icon">📍</span>
              <span>{event.location}</span>
            </div>
          )}
        </div>

        <div className="gn-card-footer">
          <div className="gn-avatars">
            {members.slice(0, 3).map((m: any, i: number) => (
              <div key={i} className="gn-avatar">
                {m.user?.avatar
                  ? <img src={m.user.avatar} alt="" />
                  : (m.user?.name || '?')[0].toUpperCase()
                }
              </div>
            ))}
            {count > 3 && (
              <div className="gn-avatar gn-avatar-overflow">+{count - 3}</div>
            )}
          </div>
          <span className="gn-player-count">
            <strong>{count}</strong>
            {event.maxParticipants ? `/${event.maxParticipants}` : ''} Joueurs
          </span>
        </div>
      </div>
    </button>
  );
};

type EventDetailPanelProps = {
  event: any;
  onClose: () => void;
  onJoin: (eventId: string) => Promise<void>;
  onLeave: (eventId: string) => Promise<void>;
  isActionLoading: boolean;
  currentUser?: { id?: string };
};

const EventDetailPanel: React.FC<EventDetailPanelProps> = ({
  event,
  onClose,
  onJoin,
  onLeave,
  isActionLoading,
  currentUser,
}) => {
  const participantCount = getMembersCount(event);
  const members: any[] = Array.isArray(event.members) ? event.members : [];
  const imageSrc = resolveEventImageUrl(event.imageUrl);
  const status = event.status
    ? (statusMap[event.status] ?? { label: event.status, cls: 'gn-badge-default' })
    : null;
  const userId = currentUser?.id;
  const isHost = Boolean(userId && userId === event.hostId);
  const isParticipant = Boolean(userId && members.some((member) => member.userId === userId));
  const isEventFull =
    event.maxParticipants ? participantCount >= event.maxParticipants : false;
  const canJoin =
    event.status === 'PLANNED' &&
    !isParticipant &&
    !isHost &&
    (!event.maxParticipants || participantCount < event.maxParticipants);

  return (
    <div className="gn-detail-layer" role="dialog" aria-modal="true">
      <div className="gn-detail-backdrop" onClick={onClose} />
      <div className="gn-detail-panel">
        <button
          type="button"
          className="gn-detail-close"
          onClick={onClose}
          aria-label="Fermer les détails de l'événement"
        >
          ×
        </button>
        <div className="gn-detail-thumb">
          {imageSrc ? (
            <img src={imageSrc} alt={event.title} />
          ) : (
            <div className="gn-card-thumb-placeholder">🎲</div>
          )}
          {status && (
            <span className={`gn-badge gn-badge-status detail ${status.cls}`}>{status.label}</span>
          )}
        </div>
        <div className="gn-detail-body">
          <p className="gn-detail-venue">
            Organisé par {event.host?.name ?? 'Un hôte mystère'}
          </p>
          <h3>{event.title}</h3>
          <p className="gn-detail-date">
            {formatDate(event.date)}
            {event.location && ` · ${event.location}`}
          </p>
          {event.description && (
            <p className="gn-detail-copy">{event.description}</p>
          )}
          <div className="gn-detail-meta">
            <div>
              <span className="gn-detail-meta-label">Participants</span>
              <strong>{participantCount}</strong>
              {event.maxParticipants && ` / ${event.maxParticipants}`}
            </div>
            <div>
              <span className="gn-detail-meta-label">Statut</span>
              <strong>{event.status ?? 'À venir'}</strong>
            </div>
          </div>
          {event.maxParticipants && isEventFull && (
            <p className="gn-detail-full">Événement complet</p>
          )}
          <div className="gn-detail-members">
            {members.slice(0, 5).map((member) => (
              <span key={member.id ?? member.userId}>
                {member.user?.name ?? member.userId ?? 'Invité'}
              </span>
            ))}
            {participantCount > 5 && <span>+{participantCount - 5} autres</span>}
          </div>
          <div className="gn-detail-actions">
            {!isHost && (
              <>
                {canJoin && (
                  <button
                    type="button"
                    className="btn-gold"
                    onClick={() => onJoin(event.id)}
                    disabled={isActionLoading}
                  >
                    {isActionLoading ? 'Rejoindre...' : 'Rejoindre'}
                  </button>
                )}
                {isParticipant && (
                  <button
                    type="button"
                    className="btn-dark"
                    onClick={() => onLeave(event.id)}
                    disabled={isActionLoading}
                  >
                    {isActionLoading ? 'Quitter...' : 'Quitter'}
                  </button>
                )}
                {!canJoin && !isParticipant && (
                  <button type="button" className="btn-dark" disabled>
                    {isEventFull ? 'Événement complet' : 'Indisponible'}
                  </button>
                )}
              </>
            )}
            <Link
              to={`/events/${event.id}`}
              className="btn-gold"
              onClick={onClose}
            >
              Voir la fiche complète
            </Link>
            <button type="button" className="btn-dark" onClick={onClose}>
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   PAGE COMPONENT
───────────────────────────────────────── */
export const HomePage: React.FC = () => {
  const {
    events,
    isLoading,
    error,
    fetchEvents,
    setError,
    joinEvent,
    leaveEvent,
  } = useEventsStore();
  const { isAuthenticated, isInitialized, user } = useAuthStore();
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

  useEffect(() => {
    if (!selectedEvent) return undefined;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedEvent(null);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [selectedEvent]);

  const handleEventSelect = (event: any) => setSelectedEvent(event);
  const closeEventPanel = () => setSelectedEvent(null);

  const handlePanelJoin = async (eventId: string) => {
    try {
      await joinEvent(eventId);
    } catch (err) {
      console.error('Failed to join event from lobby panel:', err);
    }
  };

  const handlePanelLeave = async (eventId: string) => {
    try {
      await leaveEvent(eventId);
    } catch (err) {
      console.error('Failed to leave event from lobby panel:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchEvents();
  }, [isAuthenticated, fetchEvents]);

  const styleTag = <style>{STYLES}</style>;

  if (!isInitialized) return <LoadingSpinner fullScreen />;

  if (!isAuthenticated) return (
    <>{styleTag}<VisitorHero /></>
  );

  return (
    <>
      {styleTag}
      <div className="gn-page">

        {/* ══ HERO ══ */}
        <section className="gn-hero">
          <h1 className="gn-hero-title">
            Bonjour prêt pour<br />
            <em>une partie ?</em>
          </h1>
          <p className="gn-hero-sub">
            Rassemblez vos amis autour d'un plateau. Que ce soit pour une
            stratégie épique ou un bluff audacieux, votre prochaine soirée
            commence ici.
          </p>
          <div className="gn-hero-btns">
            <Link to="/create-event" className="btn-gold">
              <span className="plus-icon">+</span>
              Créer un événement
            </Link>
            <Link to="/events" className="btn-dark">
              Explorer les jeux
            </Link>
          </div>
        </section>

        {/* ══ LE LOBBY ══ */}
        <section className="gn-lobby">
          <div className="gn-lobby-header">
            <div>
              <span className="gn-lobby-eyebrow">Le Lobby</span>
              <h2 className="gn-lobby-title">Soirées à venir</h2>
            </div>
            <Link to="/events" className="gn-see-all">Voir tout →</Link>
          </div>

          {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

          {isLoading && events.length === 0 ? (
            <LoadingSpinner size="lg" />
          ) : (
            <div className="gn-grid">
              {events.length === 0 ? (
                <div className="gn-empty">
                  <div style={{ fontSize: 44 }}>🎲</div>
                  <p>Aucune soirée pour l'instant.<br />Soyez le premier à en créer une !</p>
                </div>
                  ) : (
                events.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onSelect={handleEventSelect}
                  />
                ))
              )}
            </div>
          )}
        </section>

        {/* ══ CTA BANNER ══ */}
        <div className="gn-cta-wrap">
          <div className="gn-cta-inner">
            <div className="gn-cta-text">
              <h2>Ne jouez plus jamais seul.</h2>
              <p>
                Rejoignez une communauté de plus de 500 passionnés
                de jeux de plateau dans votre ville.
              </p>
              <Link to="/community" className="btn-cta-white">
                Explorer la communauté
              </Link>
            </div>
            <div className="gn-cta-icons">
              {[
                { icon: '🎲', dim: false },
                { icon: '🃏', dim: true  },
                { icon: '👥', dim: false },
                { icon: '🏆', dim: true  },
              ].map((item, i) => (
                <div key={i} className={`gn-cta-icon${item.dim ? ' dim' : ''}`}>
                  {item.icon}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
        {selectedEvent && (
          <EventDetailPanel
            event={selectedEvent}
            onClose={closeEventPanel}
            onJoin={handlePanelJoin}
            onLeave={handlePanelLeave}
            isActionLoading={isLoading}
            currentUser={user ?? undefined}
          />
        )}
    </>
  );
};

export default HomePage;
