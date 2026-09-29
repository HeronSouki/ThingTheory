"""Shared helpers for the Python tools: episode lookup (same rules as render/host.js) and ffmpeg."""
import json
import os
import shutil
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EPISODES = os.path.join(ROOT, 'episodes')


def list_episodes():
    return sorted(n for n in os.listdir(EPISODES)
                  if not n.startswith('_') and os.path.isfile(os.path.join(EPISODES, n, 'episode.json')))


def resolve(query=None):
    """Episode folder by name or unique prefix ("001", "greg"); None = newest. Returns (id, dir, meta)."""
    eps = list_episodes()
    if not eps:
        sys.exit('no episodes found in episodes/')
    if query:
        hits = [n for n in eps if n == query or n.startswith(query) or '-'.join(n.split('-')[1:]).startswith(query)]
        if len(hits) != 1:
            sys.exit(f'"{query}" matches {", ".join(hits)}' if hits else f'no episode matches "{query}" (have: {", ".join(eps)})')
        eid = hits[0]
    else:
        eid = eps[-1]
    d = os.path.join(EPISODES, eid)
    return eid, d, json.load(open(os.path.join(d, 'episode.json')))


def episode_arg(argv):
    """Pops --ep <query> from argv (in place) and returns the query or None."""
    if '--ep' in argv:
        i = argv.index('--ep')
        q = argv[i + 1]
        del argv[i:i + 2]
        return q
    return None


def ffmpeg():
    if os.environ.get('FFMPEG'):
        return os.environ['FFMPEG']
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError:
        return shutil.which('ffmpeg') or 'ffmpeg'
