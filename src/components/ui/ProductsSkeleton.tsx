export function ProductsSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: 8 }).map((_, index) => (
        <div 
          key={index}
          className="card overflow-hidden animate-pulse"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          {/* Image skeleton */}
          <div className="aspect-square bg-gray-200 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer"></div>
          </div>
          
          {/* Content skeleton */}
          <div className="p-4 space-y-3">
            {/* Title skeleton */}
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-shimmer"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-shimmer"></div>
            </div>
            
            {/* Price skeleton */}
            <div className="h-6 bg-gray-200 rounded w-1/2 animate-shimmer"></div>
            
            {/* Button skeleton */}
            <div className="h-10 bg-gray-200 rounded animate-shimmer"></div>
          </div>
        </div>
      ))}
    </div>
  )
}