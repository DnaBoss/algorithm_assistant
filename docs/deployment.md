# Deployment

The GitHub Actions deploy workflow builds the Vite site, connects to `essence`
through `bastion`, and uploads `dist/` to a release directory.

## Required GitHub secrets

Set these secrets in the repository or the `develop` environment:

- `GH_ACTION_SSH_PRIVATE_KEY`: private key allowed to SSH into both hosts.
- `BASTION_HOST`: bastion public IP, for example `35.221.219.23`.
- `BASTION_USER`: SSH user on bastion.
- `ESSENCE_HOST`: essence private IP from bastion, for example `10.140.0.2`.
- `ESSENCE_USER`: SSH user on essence.

## Optional GitHub variables

- `DEPLOY_PATH`: remote deploy path. Defaults to the essence user's
  `$HOME/algorithm-assistant`.
- `NODE_VERSION`: Node.js version. Defaults to `22`.

## One-time essence setup

If the site should be served by Nginx from `/var/www/algorithm_assistant`, run
these commands once on `essence` and set `DEPLOY_PATH` to
`/var/www/algorithm_assistant`:

```bash
sudo mkdir -p /var/www/algorithm_assistant/releases
sudo chown -R "$USER":"$USER" /var/www/algorithm_assistant
```

Example Nginx server block:

```nginx
server {
    listen 80;
    server_name _;

    root /var/www/algorithm_assistant/current;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

After changing Nginx config:

```bash
sudo nginx -t
sudo systemctl reload nginx
```
