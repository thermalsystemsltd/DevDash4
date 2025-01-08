<td className="px-2 py-2 text-sm text-gray-500 dark:text-gray-400">
  <div className="flex flex-col">
    <div className="flex items-center">
      <Thermometer className="h-4 w-4 mr-1 text-gray-400" />
      <span>{reading?.temperature?.toFixed(1)}°C</span>
    </div>
    {reading?.humidity !== undefined && (
      <div className="flex items-center mt-1">
        <Droplets className="h-4 w-4 mr-1 text-gray-400" />
        <span>{reading.humidity}%</span>
      </div>
    )}
  </div>
</td> 