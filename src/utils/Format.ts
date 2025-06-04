export const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes} мин ${remainingSeconds.toString().padStart(2, '0')} сек`;
};

export const formatDate = (iso: string): string => {
    return new Date(iso).toLocaleString('ru-RU', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export const formatReadableTime = (time: string): string => {
    const [min, sec, ms] = time.split(':').map(Number);
    const totalSeconds = min * 60 + sec + Math.floor(ms / 100);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}