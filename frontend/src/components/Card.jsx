const Card = ({ name, count, icon , color }) => {
  return (
    <div className="fade-up rounded-sm flex flex-1 flex-col  p-6 bg-white hover:shadow transition-all border duration-300">
      <div className="flex gap-3 items-center mb-4">
        <div>
          {icon}
        </div>
        <h3 className="text-2xl">{name}</h3>
      </div>
      <p className="text-xl font-semibold text-gray-700">{count}</p>
    </div>
  );
};

export default Card;
