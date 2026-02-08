export const NotificationToast = ({ notification }) => {
  if (!notification) return null;

  return (
    <div className={"fixed top-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-auto px-4 py-2.5 rounded-xl z-50 flex items-center gap-2.5 animate-slideDown border " + (notification.type === "error" ? "text-red-300" : "text-emerald-300")} style={{ backgroundColor: notification.type === "error" ? 'rgba(244, 63, 94, 0.1)' : 'rgba(52, 211, 153, 0.1)', borderColor: notification.type === "error" ? 'rgba(244, 63, 94, 0.2)' : 'rgba(52, 211, 153, 0.2)', backdropFilter: 'blur(16px)', boxShadow: 'var(--shadow-card)' }}>
      {notification.icon && <notification.icon className="w-4 h-4 flex-shrink-0" />}
      <span className="text-sm font-medium">{notification.message}</span>
    </div>
  );
};
