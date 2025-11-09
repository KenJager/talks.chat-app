export function formatMessageTime(date) {
  return new Date(date).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
}

export function isSameDay(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export function formatGroupDate(date) {
  const messageDate = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (isSameDay(messageDate, today)) {
    return "Aujourd'hui";
  } else if (isSameDay(messageDate, yesterday)) {
    return "Hier";
  } else {
    return messageDate.toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  }
}

// fonction utilitaire pour formater le temps
export const formatLastSeen = (lastSeenDate) => {
  if (!lastSeenDate) return "Jamais en ligne";

  const now = new Date();
  const lastSeen = new Date(lastSeenDate);
  const diffInMs = now - lastSeen;
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) {
    return "En ligne il y a 3 secondes";
  } else if (diffInMinutes < 60) {
    return `En ligne il y a ${diffInMinutes} min`;
  } else if (diffInHours < 24) {
    return `En ligne il y a ${diffInHours} h`;
  } else if (diffInDays === 1) {
    return "En ligne hier";
  } else if (diffInDays < 7) {
    return `En ligne il y a ${diffInDays} j`;
  } else {
    return `En ligne le ${lastSeen.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })}`;
  }
};

export const isRecentlyOnline = (lastSeenDate, thresholdMinutes = 5) => {
  if (!lastSeenDate) return false;
  const now = new Date();
  const lastSeen = new Date(lastSeenDate);
  const diffInMinutes = Math.floor((now - lastSeen) / (1000 * 60));
  return diffInMinutes <= thresholdMinutes;
};