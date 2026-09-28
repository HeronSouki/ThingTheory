// Locate an ffmpeg binary: $FFMPEG, the imageio-ffmpeg wheel, or ffmpeg on PATH.
import { execSync } from 'child_process';
import fs from 'fs';

function find() {
  if (process.env.FFMPEG) return process.env.FFMPEG;
  try {
    const p = execSync('python3 -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())"', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
    if (p && fs.existsSync(p)) return p;
  } catch {}
  return 'ffmpeg';
}
export const FFMPEG = find();
