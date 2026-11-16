import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs'

export const processVideo = async (inputPath: string, outputPath: string, options: {
  title?: string
  description?: string
  format?: string
  quality?: string
} = {}) => {
  return new Promise((resolve, reject) => {
    const ffmpegPath = require('ffmpeg-static')
    
    const args = [
      '-i', inputPath,
      '-c:v', 'libx264',
      '-preset', 'fast',
      '-crf', '23',
      '-c:a', 'aac',
      '-b:a', '192k',
      '-movflags', '+faststart'
    ]

    if (options.format) {
      args.push('-f', options.format)
    }

    if (options.quality) {
      args.push('-crf', options.quality)
    }

    args.push(outputPath)

    const ffmpeg = spawn(ffmpegPath, args)

    let output = ''
    let error = ''

    ffmpeg.stdout.on('data', (data) => {
      output += data.toString()
    })

    ffmpeg.stderr.on('data', (data) => {
      error += data.toString()
    })

    ffmpeg.on('close', (code) => {
      if (code === 0) {
        resolve({ success: true, output })
      } else {
        reject(new Error(`FFmpeg exited with code ${code}: ${error}`))
      }
    })

    ffmpeg.on('error', (error) => {
      reject(error)
    })
  })
}

export const getVideoDuration = async (filePath: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    const ffmpegPath = require('ffmpeg-static')
    
    const ffmpeg = spawn(ffmpegPath, [
      '-i', filePath,
      '-hide_banner',
      '-loglevel', 'error'
    ])

    let output = ''

    ffmpeg.stderr.on('data', (data) => {
      output += data.toString()
    })

    ffmpeg.on('close', (code) => {
      if (code === 0) {
        const durationMatch = output.match(/Duration: (\d{2}):(\d{2}):(\d{2}\.\d{2})/)
        if (durationMatch) {
          const hours = parseInt(durationMatch[1])
          const minutes = parseInt(durationMatch[2])
          const seconds = parseFloat(durationMatch[3])
          resolve(hours * 3600 + minutes * 60 + seconds)
        } else {
          reject(new Error('Could not parse video duration'))
        }
      } else {
        reject(new Error(`FFmpeg exited with code ${code}`))
      }
    })

    ffmpeg.on('error', (error) => {
      reject(error)
    })
  })
}

export const extractThumbnail = async (videoPath: string, outputPath: string, timestamp = '00:00:01'): Promise<void> => {
  return new Promise((resolve, reject) => {
    const ffmpegPath = require('ffmpeg-static')
    
    const ffmpeg = spawn(ffmpegPath, [
      '-i', videoPath,
      '-ss', timestamp,
      '-vframes', '1',
      '-vf', 'scale=1280:720',
      '-y',
      outputPath
    ])

    ffmpeg.on('close', (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`FFmpeg exited with code ${code}`))
      }
    })

    ffmpeg.on('error', (error) => {
      reject(error)
    })
  })
}