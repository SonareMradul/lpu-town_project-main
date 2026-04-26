// src/lib/api.js
import { supabase } from "./supabase"

export const BASE = import.meta.env.VITE_BACKEND_URL
  ? `${import.meta.env.VITE_BACKEND_URL}/api`
  : "http://localhost:4000/api"

export async function authHeaders() {
  const { data: { session } } = await supabase.auth.getSession()
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session?.access_token}`
  }
}

// ── Posts ────────────────────────────────────────
export async function getPosts(page = 1) {
  const res = await fetch(`${BASE}/posts?page=${page}`, { headers: await authHeaders() })
  return res.json()
}

export async function createPost(caption, image_url) {
  const res = await fetch(`${BASE}/posts`, {
    method: "POST", headers: await authHeaders(),
    body: JSON.stringify({ caption, image_url })
  })
  return res.json()
}

export async function toggleLike(postId) {
  const res = await fetch(`${BASE}/posts/${postId}/like`, {
    method: "POST", headers: await authHeaders()
  })
  return res.json()
}

// ── Reels ────────────────────────────────────────
export async function getReels(page = 1) {
  try {
    const res = await fetch(`${BASE}/reels?page=${page}`, { headers: await authHeaders() })
    return res.json()
  } catch { return [] }
}

export async function createReel(caption, video_url, thumbnail_url) {
  const res = await fetch(`${BASE}/reels`, {
    method: "POST", headers: await authHeaders(),
    body: JSON.stringify({ caption, video_url, thumbnail_url })
  })
  return res.json()
}

// ── Users ────────────────────────────────────────
export async function getMyProfile() {
  const res = await fetch(`${BASE}/users/me`, { headers: await authHeaders() })
  return res.json()
}

export async function updateProfile(updates) {
  const res = await fetch(`${BASE}/users/me`, {
    method: "PATCH", headers: await authHeaders(),
    body: JSON.stringify(updates)
  })
  return res.json()
}

export async function searchUsers(q) {
  const res = await fetch(`${BASE}/users/search?q=${encodeURIComponent(q)}`, { headers: await authHeaders() })
  return res.json()
}

// ── Events ───────────────────────────────────────
export async function getEvents(type) {
  const url = type ? `${BASE}/events?type=${type}` : `${BASE}/events`
  const res = await fetch(url, { headers: await authHeaders() })
  return res.json()
}

// ── Notifications ────────────────────────────────
export async function getNotifications() {
  const res = await fetch(`${BASE}/notifications`, { headers: await authHeaders() })
  return res.json()
}

// ── Storage ──────────────────────────────────────
export async function uploadFile(bucket, file, userId) {
  return uploadImage(bucket, file, userId)
}

export async function uploadImage(bucket, file, userId) {
  const ext  = file.name.split(".").pop().toLowerCase()
  const path = `${userId}/${Date.now()}.${ext}`
  const { error } = await supabase.storage.from(bucket).upload(path, file, { cacheControl: "3600", upsert: false })
  if (error) throw new Error(error.message)
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

export async function uploadVideo(file, userId, onProgress) {
  const ext  = file.name.split(".").pop().toLowerCase()
  const path = `${userId}/${Date.now()}.${ext}`

  return new Promise(async (resolve, reject) => {
    const { data: { session } } = await supabase.auth.getSession()
    const xhr = new XMLHttpRequest()
    const url = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/reels/${path}`

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100))
    }
    xhr.onload = () => {
      if (xhr.status === 200) {
        const { data } = supabase.storage.from("reels").getPublicUrl(path)
        resolve(data.publicUrl)
      } else reject(new Error("Video upload failed"))
    }
    xhr.onerror = () => reject(new Error("Network error"))
    xhr.open("POST", url)
    xhr.setRequestHeader("Authorization", `Bearer ${session.access_token}`)
    xhr.setRequestHeader("x-upsert", "false")
    xhr.setRequestHeader("Content-Type", file.type || "video/mp4")
    xhr.send(file)
  })
}

export async function generateThumbnail(videoFile) {
  return new Promise((resolve) => {
    const video  = document.createElement("video")
    const canvas = document.createElement("canvas")
    const url    = URL.createObjectURL(videoFile)
    video.src = url; video.muted = true; video.currentTime = 1
    video.onloadeddata = () => {
      canvas.width = video.videoWidth; canvas.height = video.videoHeight
      canvas.getContext("2d").drawImage(video, 0, 0)
      canvas.toBlob(blob => { URL.revokeObjectURL(url); resolve(blob) }, "image/jpeg", 0.7)
    }
    video.onerror = () => { URL.revokeObjectURL(url); resolve(null) }
  })
}

// ── Delete ───────────────────────────────────────
export async function deletePost(postId) {
  const res = await fetch(`${BASE}/posts/${postId}`, {
    method: "DELETE", headers: await authHeaders()
  })
  return res.json()
}

export async function deleteReel(reelId) {
  const res = await fetch(`${BASE}/reels/${reelId}`, {
    method: "DELETE", headers: await authHeaders()
  })
  return res.json()
}

export async function createEvent(data) {
  const res = await fetch(`${BASE}/events`, {
    method: "POST", headers: await authHeaders(),
    body: JSON.stringify(data)
  })
  return res.json()
}

export async function deleteEvent(eventId) {
  const res = await fetch(`${BASE}/events/${eventId}`, {
    method: "DELETE", headers: await authHeaders()
  })
  return res.json()
}

export async function getReelComments(reelId) {
  const res = await fetch(`${BASE}/reels/${reelId}/comments`, { headers: await authHeaders() })
  return res.json()
}

export async function postReelComment(reelId, content) {
  const res = await fetch(`${BASE}/reels/${reelId}/comments`, {
    method: "POST", headers: await authHeaders(),
    body: JSON.stringify({ content })
  })
  return res.json()
}