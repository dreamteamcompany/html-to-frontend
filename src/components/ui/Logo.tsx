const Logo = ({ className = "" }: { className?: string }) => {
  return (
    <img
      src="https://cdn.poehali.dev/projects/f80fd906-4206-41c6-bbee-1ea450433e49/bucket/958c98a8-17ab-42d5-9141-f2991ec6b529.png"
      alt="Команда Мечты"
      className={className}
    />
  );
};

export default Logo;
