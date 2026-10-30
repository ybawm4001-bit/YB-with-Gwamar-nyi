import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Video, User, VideoComment, NotificationItem } from '../types';

interface YBTubeDBSchema extends DBSchema {
  video_blobs: {
    key: string;
    value: {
      id: string;
      blob: Blob;
      mimeType: string;
      createdAt: number;
    };
  };
  videos: {
    key: string;
    value: Video;
    indexes: {
      'by-creator': string;
      'by-category': string;
      'by-isShort': number;
    };
  };
  users: {
    key: string;
    value: User;
    indexes: {
      'by-email': string;
      'by-handle': string;
    };
  };
  comments: {
    key: string;
    value: VideoComment;
    indexes: {
      'by-video': string;
    };
  };
  notifications: {
    key: string;
    value: NotificationItem;
    indexes: {
      'by-user': string;
    };
  };
}

const DB_NAME = 'YB_TUBE_DATABASE_V1';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<YBTubeDBSchema>> | null = null;

export async function getDB(): Promise<IDBPDatabase<YBTubeDBSchema>> {
  if (!dbPromise) {
    dbPromise = openDB<YBTubeDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Store for full video media Blobs
        if (!db.objectStoreNames.contains('video_blobs')) {
          db.createObjectStore('video_blobs', { keyPath: 'id' });
        }
        // Store for video metadata
        if (!db.objectStoreNames.contains('videos')) {
          const videoStore = db.createObjectStore('videos', { keyPath: 'id' });
          videoStore.createIndex('by-creator', 'creatorId');
          videoStore.createIndex('by-category', 'category');
          videoStore.createIndex('by-isShort', 'isShort');
        }
        // Store for users
        if (!db.objectStoreNames.contains('users')) {
          const userStore = db.createObjectStore('users', { keyPath: 'id' });
          userStore.createIndex('by-email', 'email', { unique: true });
          userStore.createIndex('by-handle', 'handle', { unique: true });
        }
        // Store for comments
        if (!db.objectStoreNames.contains('comments')) {
          const commentStore = db.createObjectStore('comments', { keyPath: 'id' });
          commentStore.createIndex('by-video', 'videoId');
        }
        // Store for notifications
        if (!db.objectStoreNames.contains('notifications')) {
          const notifStore = db.createObjectStore('notifications', { keyPath: 'id' });
          notifStore.createIndex('by-user', 'userId');
        }
      },
    });
  }
  return dbPromise;
}

// ---------------- Video Blob Permanent Storage ---------------- //

export async function saveVideoBlob(id: string, blob: Blob, mimeType: string): Promise<void> {
  const db = await getDB();
  await db.put('video_blobs', {
    id,
    blob,
    mimeType: mimeType || blob.type || 'video/webm',
    createdAt: Date.now(),
  });
}

export async function getVideoBlob(id: string): Promise<Blob | null> {
  const db = await getDB();
  const record = await db.get('video_blobs', id);
  if (!record) return null;
  // Ensure typed blob with proper mimeType for reliable cross-browser video decoding
  const effectiveMime = record.mimeType || record.blob.type || 'video/webm';
  if (record.blob.type !== effectiveMime) {
    return new Blob([record.blob], { type: effectiveMime });
  }
  return record.blob;
}

export async function deleteVideoBlob(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('video_blobs', id);
}

// ---------------- Video Metadata Permanent Storage ---------------- //

export async function saveVideoMeta(video: Video): Promise<void> {
  const db = await getDB();
  await db.put('videos', video);
}

// Storage stats for high-capacity multi-user monitoring
export async function getStorageStats(): Promise<{
  usageMB: number;
  quotaMB: number;
  percentUsed: number;
  totalVideos: number;
  totalBlobs: number;
  totalUsers: number;
  totalComments: number;
}> {
  const db = await getDB();
  let usageMB = 0;
  let quotaMB = 0;
  let percentUsed = 0;

  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
    try {
      const estimate = await navigator.storage.estimate();
      usageMB = Math.round(((estimate.usage || 0) / (1024 * 1024)) * 10) / 10;
      quotaMB = Math.round(((estimate.quota || 0) / (1024 * 1024)) * 10) / 10;
      percentUsed = quotaMB > 0 ? Math.round((usageMB / quotaMB) * 100) : 0;
    } catch {
      // ignore
    }
  }

  const [totalVideos, totalBlobs, totalUsers, totalComments] = await Promise.all([
    db.count('videos'),
    db.count('video_blobs'),
    db.count('users'),
    db.count('comments'),
  ]);

  return {
    usageMB,
    quotaMB,
    percentUsed,
    totalVideos,
    totalBlobs,
    totalUsers,
    totalComments,
  };
}

export async function getAllStoredVideos(): Promise<Video[]> {
  const db = await getDB();
  const rawVideos = await db.getAll('videos');

  // Re-generate working blob URLs for videos that have local blobs stored in IndexedDB
  const restoredVideos: Video[] = [];
  for (const v of rawVideos) {
    if (v.hasLocalBlob && v.blobKey) {
      const blob = await getVideoBlob(v.blobKey);
      if (blob) {
        const objectUrl = URL.createObjectURL(blob);
        restoredVideos.push({
          ...v,
          url: objectUrl,
        });
        continue;
      }
    }
    restoredVideos.push(v);
  }

  return restoredVideos;
}

export async function deleteStoredVideo(id: string): Promise<void> {
  const db = await getDB();
  const video = await db.get('videos', id);
  if (video?.blobKey) {
    await deleteVideoBlob(video.blobKey);
  }
  await db.delete('videos', id);

  // Also remove comments associated with this video
  const comments = await db.getAllFromIndex('comments', 'by-video', id);
  for (const c of comments) {
    await db.delete('comments', c.id);
  }
}

// ---------------- User Accounts Permanent Storage ---------------- //

export async function saveUserToDB(user: User): Promise<void> {
  const db = await getDB();
  await db.put('users', user);
}

export async function getUserFromDB(id: string): Promise<User | undefined> {
  const db = await getDB();
  return db.get('users', id);
}

export async function getAllUsersFromDB(): Promise<User[]> {
  const db = await getDB();
  return db.getAll('users');
}

// ---------------- Comments Permanent Storage ---------------- //

export async function saveCommentToDB(comment: VideoComment): Promise<void> {
  const db = await getDB();
  await db.put('comments', comment);
}

export async function getCommentsForVideo(videoId: string): Promise<VideoComment[]> {
  const db = await getDB();
  return db.getAllFromIndex('comments', 'by-video', videoId);
}

export async function deleteCommentFromDB(commentId: string): Promise<void> {
  const db = await getDB();
  await db.delete('comments', commentId);
}

// ---------------- Notifications Permanent Storage ---------------- //

export async function saveNotificationToDB(notif: NotificationItem): Promise<void> {
  const db = await getDB();
  await db.put('notifications', notif);
}

export async function getNotificationsForUser(userId: string): Promise<NotificationItem[]> {
  const db = await getDB();
  return db.getAllFromIndex('notifications', 'by-user', userId);
}

export async function markNotificationAsRead(id: string): Promise<void> {
  const db = await getDB();
  const notif = await db.get('notifications', id);
  if (notif) {
    notif.read = true;
    await db.put('notifications', notif);
  }
}
