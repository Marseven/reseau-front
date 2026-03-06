#!/bin/bash
# ============================================================
#  ReseauApp Frontend - Script de déploiement
#  Serveur : rmap.jobs-conseil.host
#  Usage   : bash deploy.sh
# ============================================================

set -e

# ── Configuration ──
REPO_URL="https://github.com/Marseven/reseau-front.git"
BRANCH="main"
PUBLIC_HTML="$HOME/domains/rmap.jobs-conseil.host/public_html"
REPO_DIR="$HOME/reseau-front"
BACKUP_DIR="$HOME/backups/reseau-front"

# ── Couleurs ──
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

log()   { echo -e "${GREEN}[✓]${NC} $1"; }
warn()  { echo -e "${YELLOW}[!]${NC} $1"; }
error() { echo -e "${RED}[✗]${NC} $1"; exit 1; }
info()  { echo -e "${CYAN}[→]${NC} $1"; }

echo ""
echo -e "${CYAN}══════════════════════════════════════════════${NC}"
echo -e "${CYAN}   ReseauApp Frontend - Déploiement${NC}"
echo -e "${CYAN}══════════════════════════════════════════════${NC}"
echo ""

# ── Étape 1 : Backup ──
info "Sauvegarde de la version actuelle..."
mkdir -p "$BACKUP_DIR"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
if [ -f "$PUBLIC_HTML/index.html" ]; then
    tar -czf "$BACKUP_DIR/backup_${TIMESTAMP}.tar.gz" -C "$PUBLIC_HTML" . 2>/dev/null && \
        log "Backup créé : backup_${TIMESTAMP}.tar.gz" || \
        warn "Backup échoué (première installation ?)"
    # Garder seulement les 5 derniers backups
    ls -t "$BACKUP_DIR"/backup_*.tar.gz 2>/dev/null | tail -n +6 | xargs rm -f 2>/dev/null
else
    warn "Aucun fichier existant à sauvegarder (première installation)"
fi

# ── Étape 2 : Clone ou Pull ──
if [ -d "$REPO_DIR/.git" ]; then
    info "Mise à jour du dépôt..."
    cd "$REPO_DIR"
    git fetch origin "$BRANCH" --quiet
    git reset --hard "origin/$BRANCH" --quiet 2>/dev/null || git reset --hard "origin/$BRANCH"
    log "Dépôt mis à jour ($(git log -1 --format='%h - %s'))"
else
    info "Clonage du dépôt..."
    rm -rf "$REPO_DIR"
    git clone --branch "$BRANCH" --depth 1 "$REPO_URL" "$REPO_DIR"
    cd "$REPO_DIR"
    log "Dépôt cloné"
fi

# ── Étape 3 : Installer les dépendances et builder ──
info "Installation des dépendances..."
npm install --production=false --silent 2>&1 | tail -1
log "Dépendances installées"

info "Build de l'application..."
npm run build 2>&1 | tail -3
if [ ! -f "$REPO_DIR/dist/index.html" ]; then
    error "Build échoué : dist/index.html introuvable."
fi
log "Build terminé"

# ── Étape 4 : Déployer ──
info "Déploiement vers public_html..."

# Nettoyer public_html (sauf .htaccess et fichiers cachés importants)
find "$PUBLIC_HTML" -mindepth 1 -not -name '.htaccess' -not -name '.well-known' -not -path '*/.well-known/*' -delete 2>/dev/null || true

# Copier les fichiers du build
cp -r "$REPO_DIR/dist/"* "$PUBLIC_HTML/"
cp -r "$REPO_DIR/dist/".* "$PUBLIC_HTML/" 2>/dev/null || true

log "Fichiers déployés"

# ── Étape 5 : .htaccess pour SPA routing ──
info "Configuration .htaccess..."
cat > "$PUBLIC_HTML/.htaccess" << 'HTACCESS'
# ── ReseauApp SPA - Apache Configuration ──

# ── MIME Types (ForceType pour surcharger la config serveur) ──
<FilesMatch "\.js$">
    ForceType application/javascript
</FilesMatch>
<FilesMatch "\.mjs$">
    ForceType application/javascript
</FilesMatch>
<FilesMatch "\.css$">
    ForceType text/css
</FilesMatch>
<FilesMatch "\.json$">
    ForceType application/json
</FilesMatch>
<FilesMatch "\.svg$">
    ForceType image/svg+xml
</FilesMatch>
<FilesMatch "\.wasm$">
    ForceType application/wasm
</FilesMatch>

# Activer le moteur de réécriture
RewriteEngine On

# Redirection HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# SPA Routing : rediriger toutes les requêtes vers index.html
# sauf les fichiers/dossiers qui existent physiquement
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ /index.html [L]

# ── Cache & Performance ──

# Assets avec hash (cache longue durée - 1 an)
<FilesMatch "\.(js|css)$">
    <IfModule mod_headers.c>
        Header set Cache-Control "public, max-age=31536000, immutable"
    </IfModule>
</FilesMatch>

# Images et fonts (cache 30 jours)
<FilesMatch "\.(ico|svg|png|jpg|jpeg|gif|webp|woff|woff2|ttf|eot)$">
    <IfModule mod_headers.c>
        Header set Cache-Control "public, max-age=2592000"
    </IfModule>
</FilesMatch>

# HTML (pas de cache pour toujours servir la dernière version)
<FilesMatch "\.html$">
    <IfModule mod_headers.c>
        Header set Cache-Control "no-cache, no-store, must-revalidate"
        Header set Pragma "no-cache"
        Header set Expires "0"
    </IfModule>
</FilesMatch>

# ── Compression Gzip ──
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/css application/javascript application/json image/svg+xml
</IfModule>

# ── Sécurité ──
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-XSS-Protection "1; mode=block"
    Header set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

# Bloquer l'accès aux fichiers sensibles
<FilesMatch "\.(env|git|gitignore|md|sh|lock)$">
    Order allow,deny
    Deny from all
</FilesMatch>
HTACCESS

log ".htaccess configuré (SPA routing + cache + sécurité)"

# ── Étape 6 : Permissions ──
info "Mise à jour des permissions..."
find "$PUBLIC_HTML" -type f -exec chmod 644 {} \;
find "$PUBLIC_HTML" -type d -exec chmod 755 {} \;
log "Permissions appliquées (644/755)"

# ── Résumé ──
echo ""
echo -e "${GREEN}══════════════════════════════════════════════${NC}"
echo -e "${GREEN}   Déploiement terminé avec succès !${NC}"
echo -e "${GREEN}══════════════════════════════════════════════${NC}"
echo ""
echo -e "  ${CYAN}URL${NC}     : https://rmap.jobs-conseil.host"
echo -e "  ${CYAN}Commit${NC}  : $(cd "$REPO_DIR" && git log -1 --format='%h %s')"
echo -e "  ${CYAN}Date${NC}    : $(date '+%d/%m/%Y %H:%M:%S')"
echo -e "  ${CYAN}Backup${NC}  : backup_${TIMESTAMP}.tar.gz"
echo ""
