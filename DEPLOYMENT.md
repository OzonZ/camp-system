# 🚀 Deployment Guide - Guild Camp System

## Option 1: Local Testing (Recommended for Setup)

### Requirements
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Supabase account with project created

### Steps
1. **Set up Supabase**
   - Go to https://supabase.com and create account
   - Create new project
   - Note your `Project URL` and `Anon Key`

2. **Create Database Tables**
   - In Supabase dashboard → SQL Editor
   - Copy and paste all SQL from `SETUP_SUPABASE.md`
   - Execute

3. **Update Credentials in index.html**
   ```javascript
   // Line ~618 in index.html
   const SUPA_URL = 'https://your-project.supabase.co';
   const SUPA_KEY = 'your-anon-key';
   const ADMIN_PASSWORD = 'your-password'; // or keep 'camp2025'
   ```

4. **Open in Browser**
   - Right-click `index.html` → Open with Browser
   - Or drag `index.html` into browser tab

5. **Test**
   - Create account: Enter name → Create Guild
   - Test Admin: Click "🛠️ เข้าสู่ระบบ Admin" → Password: `camp2025`

---

## Option 2: GitHub Pages (Free Hosting)

### Prerequisites
- GitHub account
- Git installed (or use GitHub web interface)

### Steps

1. **Create GitHub Repository**
   ```bash
   # Or create via GitHub web interface
   git init
   git add .
   git commit -m "Initial commit: Guild Camp System"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/camp-system.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**
   - Go to your repository → Settings → Pages
   - Source: Deploy from branch → main
   - Save
   - Your site will be live at: `https://YOUR_USERNAME.github.io/camp-system`

3. **Update index.html for CORS**
   - Supabase already handles CORS, no changes needed

---

## Option 3: Netlify (Free Tier)

### Steps

1. **Connect Repository to Netlify**
   - Go to https://netlify.com
   - Connect your GitHub account
   - Select camp-system repository
   - Build command: (leave empty)
   - Deploy folder: (leave empty)

2. **Deploy**
   - Netlify auto-deploys on push
   - Your site: `https://your-site.netlify.app`

---

## Option 4: Vercel (Free Tier)

### Steps

1. **Deploy to Vercel**
   - Go to https://vercel.com
   - Import project from GitHub
   - Framework: Other (Static)
   - Deploy

2. **Access Site**
   - Your site: `https://your-project.vercel.app`

---

## Option 5: Self-Hosted VPS

### Requirements
- VPS/Server with web server (Nginx, Apache)
- SSL certificate (Let's Encrypt)

### Steps

1. **Upload Files**
   ```bash
   scp index.html user@server:/var/www/html/camp-system/
   scp README.md user@server:/var/www/html/camp-system/
   scp SETUP_SUPABASE.md user@server:/var/www/html/camp-system/
   ```

2. **Configure Web Server (Nginx example)**
   ```nginx
   server {
       listen 443 ssl;
       server_name camp-system.example.com;
       
       ssl_certificate /etc/letsencrypt/live/camp-system.example.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/camp-system.example.com/privkey.pem;
       
       root /var/www/html/camp-system;
       index index.html;
       
       location / {
           try_files $uri $uri/ =404;
       }
   }
   ```

3. **Enable SSL**
   ```bash
   sudo certbot certonly --webroot -w /var/www/html/camp-system -d camp-system.example.com
   ```

---

## Environment Security

### Important: Never commit credentials!

1. **For Production**
   - Use environment variables
   - Create `.env.local` (gitignored)
   ```
   VITE_SUPA_URL=https://your-project.supabase.co
   VITE_SUPA_KEY=your-anon-key
   ```

2. **For Supabase Row Level Security**
   Enable RLS policies:
   ```sql
   ALTER TABLE guilds ENABLE ROW LEVEL SECURITY;
   ALTER TABLE members ENABLE ROW LEVEL SECURITY;
   ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
   ```

---

## Performance Optimization

### For Production

1. **Minify index.html**
   ```bash
   npm install -g html-minifier
   html-minifier --collapse-whitespace index.html > index.min.html
   ```

2. **Add CDN**
   - Cloudflare (free plan)
   - Bunny CDN
   - AWS CloudFront

3. **Enable Caching**
   ```
   Cache-Control: public, max-age=3600
   ```

---

## Monitoring & Maintenance

### Supabase Monitoring
- Dashboard → Logs
- Check database usage
- Monitor API calls

### Backup Data
```bash
# Export from Supabase
# Dashboard → Database → Backups
```

### Error Tracking
- Set up browser error logging
- Monitor Admin Log in app
- Check browser console (F12)

---

## Troubleshooting

### Connection Issues
1. Verify Supabase URL and Key
2. Check firewall/CORS settings
3. Test in Incognito mode

### Database Issues
1. Confirm tables created
2. Run SQL migration again
3. Check table permissions

### Auth Issues
1. Clear browser cache
2. Check Admin password
3. Verify Supabase auth enabled

---

## Testing Checklist

- [ ] Login with name
- [ ] Create guild
- [ ] Join existing guild
- [ ] View quests
- [ ] View teams
- [ ] View members
- [ ] View cards (member)
- [ ] Use card (leader only)
- [ ] View competitions
- [ ] View leaderboard
- [ ] Admin login
- [ ] Admin create quest
- [ ] Admin give card
- [ ] Admin create competition
- [ ] Admin view log
- [ ] Admin adjust points

---

## Support & Troubleshooting

### Common Issues

**"Cannot connect to Supabase"**
- Check URL format (must start with https://)
- Verify API key is correct
- Check internet connection

**"Database table doesn't exist"**
- Run SQL migration again
- Check table creation for errors
- Verify in Supabase dashboard

**"Admin password not working"**
- Check spelling (case-sensitive)
- Default: `camp2025`
- Edit in index.html line ~620

**"Cards not showing"**
- Make sure `initSystemCards()` runs (admin login)
- Check cards table has data
- Refresh page

