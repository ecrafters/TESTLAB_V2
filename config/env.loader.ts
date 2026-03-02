import { EnvConfig } from './env.types';
import * as fs from 'fs';
import * as path from 'path';

export function loadEnvConfig(): EnvConfig {
    const env = process.env.NODE_ENV || 'preprod';
    
    // Utiliser le chemin relatif depuis la racine du projet
    const projectRoot = process.cwd();
    const configPath = path.join(projectRoot, 'config', `env.${env}.json`);
    
    if (!fs.existsSync(configPath)) {
        throw new Error(`Configuration file not found: ${configPath}. Current NODE_ENV: ${env}`);
    }
    
    const configFile = fs.readFileSync(configPath, 'utf-8');
    const config = JSON.parse(configFile) as EnvConfig;
    
    // Vérifier que les champs requis sont présents
    if (!config.username || !config.password) {
        throw new Error(`Missing username or password in config file: ${configPath}`);
    }
    
    return config;
}

// Export direct de la config pour utilisation facile
export const envConfig = loadEnvConfig();
