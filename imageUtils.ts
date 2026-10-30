/**
 * Utilities for client-side image processing, compression, and presets.
 */

export async function compressAndResizeImage(
  file: File,
  maxWidth = 1200,
  maxHeight = 675,
  quality = 0.88
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Attempt webp first, fallback to jpeg
        try {
          const webpData = canvas.toDataURL('image/webp', quality);
          if (webpData.startsWith('data:image/webp')) {
            resolve(webpData);
            return;
          }
        } catch {
          // ignore
        }

        const jpegData = canvas.toDataURL('image/jpeg', quality);
        resolve(jpegData);
      };
      img.onerror = () => reject(new Error('Failed to load image file'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export const PRESET_AVATARS = [
  {
    id: 'avatar_1',
    name: 'Modern Creator',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar_2',
    name: 'Tech Specialist',
    url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar_3',
    name: 'Content Creator',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar_4',
    name: 'Gamer Vlogger',
    url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar_5',
    name: 'Creative Artist',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar_6',
    name: '3D Cool Avatar',
    url: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar_7',
    name: 'Digital Nomad',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar_8',
    name: 'Anime Aesthetic',
    url: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400&auto=format&fit=crop&q=80',
  },
];

export const PRESET_COVERS = [
  {
    id: 'cover_1',
    name: 'Neon Cyberpunk City',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1400&auto=format&fit=crop&q=80',
  },
  {
    id: 'cover_2',
    name: 'Abstract Fluid 3D',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1400&auto=format&fit=crop&q=80',
  },
  {
    id: 'cover_3',
    name: 'Golden Sunset & Mountains',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1400&auto=format&fit=crop&q=80',
  },
  {
    id: 'cover_4',
    name: 'Dark Tech Minimalist',
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1400&auto=format&fit=crop&q=80',
  },
  {
    id: 'cover_5',
    name: 'Vibrant Aurora Waves',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1400&auto=format&fit=crop&q=80',
  },
  {
    id: 'cover_6',
    name: 'Gaming Studio Lights',
    url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1400&auto=format&fit=crop&q=80',
  },
  {
    id: 'cover_7',
    name: 'Anime Aesthetic Sky',
    url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1400&auto=format&fit=crop&q=80',
  },
  {
    id: 'cover_8',
    name: 'Gold & Black Luxury',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&auto=format&fit=crop&q=80',
  },
];
