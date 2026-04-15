import { Link } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import {
  FiArrowLeft,
  FiArrowRight,
  FiCamera,
  FiCheckCircle,
  FiChevronDown,
  FiSearch,
  FiSliders,
} from 'react-icons/fi';
import { motion } from 'motion/react';
import { ImageWithFallback } from '@components/figma/ImageWithFallback';
import { formatMoneyVND } from '@/utils/money';
import { usePackages } from '@/hooks/usePackages';
import defaultImage from '@assets/default-image.svg';

const PACKAGES_PER_PAGE = 6;
const PAGINATION_SIBLING_COUNT = 1;

type PaginationItem = number | 'ellipsis-start' | 'ellipsis-end';

function buildPaginationItems(currentPage: number, totalPages: number): PaginationItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const startPage = Math.max(2, currentPage - PAGINATION_SIBLING_COUNT);
  const endPage = Math.min(totalPages - 1, currentPage + PAGINATION_SIBLING_COUNT);
  const items: PaginationItem[] = [1];

  if (startPage > 2) {
    items.push('ellipsis-start');
  }

  for (let page = startPage; page <= endPage; page += 1) {
    items.push(page);
  }

  if (endPage < totalPages - 1) {
    items.push('ellipsis-end');
  }

  items.push(totalPages);

  return items;
}

export function PackagesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  const [minPriceInput, setMinPriceInput] = useState('');
  const [maxPriceInput, setMaxPriceInput] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [debouncedMinPriceInput, setDebouncedMinPriceInput] = useState('');
  const [debouncedMaxPriceInput, setDebouncedMaxPriceInput] = useState('');
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);
  const searchInputId = 'package-search-filter';
  const minPriceInputId = 'package-min-price-filter';
  const maxPriceInputId = 'package-max-price-filter';
  const sortSelectId = 'package-sort-filter';
  const filterPanelId = 'package-filter-panel';

  const sortConfig = useMemo(() => {
    switch (sortOption) {
      case 'oldest':
        return { sortBy: 'createdAt', sortOrder: 'asc' as const };
      case 'price-low':
        return { sortBy: 'price', sortOrder: 'asc' as const };
      case 'price-high':
        return { sortBy: 'price', sortOrder: 'desc' as const };
      case 'name-az':
        return { sortBy: 'name', sortOrder: 'asc' as const };
      case 'name-za':
        return { sortBy: 'name', sortOrder: 'desc' as const };
      default:
        return { sortBy: 'createdAt', sortOrder: 'desc' as const };
    }
  }, [sortOption]);

  const customMinPrice = debouncedMinPriceInput.trim() ? Number(debouncedMinPriceInput) : undefined;
  const customMaxPrice = debouncedMaxPriceInput.trim() ? Number(debouncedMaxPriceInput) : undefined;
  const effectiveMinPrice =
    customMinPrice !== undefined && Number.isFinite(customMinPrice) ? customMinPrice : undefined;
  const effectiveMaxPrice =
    customMaxPrice !== undefined && Number.isFinite(customMaxPrice) ? customMaxPrice : undefined;

  const {
    packages: apiPackages,
    loading,
    pagination,
  } = usePackages({
    page: currentPage,
    limit: PACKAGES_PER_PAGE,
    search: debouncedSearchQuery,
    minPrice: effectiveMinPrice,
    maxPrice: effectiveMaxPrice,
    sortBy: sortConfig.sortBy,
    sortOrder: sortConfig.sortOrder,
  });

  useEffect(() => {
    const debounceTimer = window.setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => window.clearTimeout(debounceTimer);
  }, [searchQuery]);

  useEffect(() => {
    const debounceTimer = window.setTimeout(() => {
      setDebouncedMinPriceInput(minPriceInput);
      setDebouncedMaxPriceInput(maxPriceInput);
    }, 300);

    return () => window.clearTimeout(debounceTimer);
  }, [maxPriceInput, minPriceInput]);

  const displayPackages = apiPackages.map((pkg) => ({
    id: pkg.id,
    name: pkg.name,
    price: pkg.price || 0,
    description: pkg.description || 'Wedding service package',
    features:
      pkg.services && pkg.services.length > 0
        ? pkg.services
            .map((serviceItem) => serviceItem.service?.name)
            .filter((name): name is string => Boolean(name))
            .slice(0, 3)
        : ['See details for included services'],
    image: pkg.coverImageUrl || pkg.images?.[0]?.imageUrl || defaultImage,
    images: pkg.images,
    services: pkg.services,
    isActive: pkg.isActive,
    popular: false,
  }));

  const normalizedSearchQuery = debouncedSearchQuery.trim().toLowerCase();
  const totalPackages = pagination?.total ?? displayPackages.length;
  const totalPages = pagination?.totalPages ?? (totalPackages > 0 ? 1 : 0);
  const activePage = pagination?.page ?? currentPage;
  const pageSize = pagination?.limit ?? PACKAGES_PER_PAGE;
  const paginationItems = useMemo(
    () => buildPaginationItems(activePage, Math.max(totalPages, 1)),
    [activePage, totalPages]
  );

  const visibleRangeStart = totalPackages === 0 ? 0 : (activePage - 1) * pageSize + 1;
  const visibleRangeEnd = totalPackages === 0 ? 0 : visibleRangeStart + displayPackages.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-rose-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-serif text-gray-800 mb-4">Packages</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the perfect package to capture your special day
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 rounded-xl border border-rose-100 bg-white p-4 shadow-md md:p-5"
        >
          <h2>
            <button
              type="button"
              aria-expanded={isFiltersVisible}
              aria-controls={filterPanelId}
              onClick={() => setIsFiltersVisible((visible) => !visible)}
              className="flex w-full items-center justify-between gap-3 text-left"
            >
              <span className="flex items-center gap-2">
                <FiSliders className="size-4 text-rose-500" />
                <span className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-700">
                  Filters
                </span>
              </span>
              <span className="inline-flex size-9 items-center justify-center rounded-full border border-rose-200 bg-white text-rose-600 shadow-sm transition hover:-translate-y-0.5 hover:border-rose-300 hover:shadow-md">
                <FiChevronDown
                  className={`size-3.5 transition-transform ${isFiltersVisible ? 'rotate-180' : ''}`}
                />
              </span>
            </button>
          </h2>

          <div
            id={filterPanelId}
            className={`${isFiltersVisible ? 'mt-3 grid' : 'hidden'} grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-6 xl:items-end`}
          >
            <div className="sm:col-span-2 xl:col-span-2">
              <label htmlFor={searchInputId} className="sr-only">
                Search
              </label>
              <div className="relative">
                <FiSearch className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-rose-400" />
                <span className="pointer-events-none absolute left-8 top-1/2 -translate-y-1/2 text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-400">
                  Search
                </span>
                <input
                  id={searchInputId}
                  name="packageSearch"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Name, service"
                  className="h-9 w-full rounded-md border border-gray-200 py-0 pl-[5.7rem] pr-3 text-xs text-gray-700 transition placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>
            </div>

            <div className="xl:max-w-[150px]">
              <label htmlFor={minPriceInputId} className="sr-only">
                Min
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-400">
                  Min
                </span>
                <input
                  id={minPriceInputId}
                  name="minPrice"
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={minPriceInput}
                  onChange={(e) => {
                    setMinPriceInput(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="0"
                  className="h-9 w-full rounded-md border border-gray-200 py-0 pl-12 pr-3 text-xs text-gray-700 transition placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>
            </div>

            <div className="xl:max-w-[150px]">
              <label htmlFor={maxPriceInputId} className="sr-only">
                Max
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-400">
                  Max
                </span>
                <input
                  id={maxPriceInputId}
                  name="maxPrice"
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={maxPriceInput}
                  onChange={(e) => {
                    setMaxPriceInput(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="300000"
                  className="h-9 w-full rounded-md border border-gray-200 py-0 pl-12 pr-3 text-xs text-gray-700 transition placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>
            </div>

            <div className="xl:max-w-[170px]">
              <label htmlFor={sortSelectId} className="sr-only">
                Sort
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-400">
                  Sort
                </span>
                <select
                  id={sortSelectId}
                  name="sortBy"
                  value={sortOption}
                  onChange={(e) => {
                    setSortOption(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-9 w-full rounded-md border border-gray-200 py-0 pl-12 pr-8 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-400"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name-az">Name: A to Z</option>
                  <option value="name-za">Name: Z to A</option>
                </select>
              </div>
            </div>

            <div className="sm:col-span-2 xl:col-span-6 flex justify-start pt-1">
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setDebouncedSearchQuery('');
                  setMinPriceInput('');
                  setMaxPriceInput('');
                  setDebouncedMinPriceInput('');
                  setDebouncedMaxPriceInput('');
                  setSortOption('newest');
                  setCurrentPage(1);
                }}
                className="inline-flex h-9 items-center rounded-full border border-rose-200 bg-white px-3.5 text-xs font-semibold text-rose-600 shadow-sm transition hover:-translate-y-0.5 hover:border-rose-300 hover:shadow-md"
              >
                Clear
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            Array.from({ length: PACKAGES_PER_PAGE }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl overflow-hidden shadow-lg animate-pulse"
              >
                <div className="h-56 bg-gray-200" />
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-8 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))
          ) : displayPackages.length > 0 ? (
            displayPackages.map((pkg, index) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`flex h-full bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer group ${
                  pkg.popular ? 'ring-2 ring-rose-400' : ''
                }`}
              >
                <Link
                  to="/packages/$packageId"
                  params={{ packageId: String(pkg.id) }}
                  className="flex h-full w-full flex-col"
                >
                  {pkg.popular && (
                    <div className="bg-gradient-to-r from-rose-400 to-pink-500 text-white text-center py-2 text-sm font-medium">
                      Most Popular
                    </div>
                  )}

                  <div className="relative h-56 overflow-hidden">
                    <ImageWithFallback
                      src={pkg.image}
                      alt={pkg.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 backdrop-blur-sm">
                      <div className="flex items-center gap-1">
                        <FiCamera className="size-4 text-rose-500" />
                        <span className="text-xs font-medium text-gray-700">Package</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="text-2xl font-serif text-gray-800 mb-2">{pkg.name}</h3>
                    <p className="text-sm text-gray-600 mb-4">{pkg.description}</p>
                    <p className="text-3xl font-medium text-rose-500 mb-4">
                      {formatMoneyVND(pkg.price)}
                    </p>

                    <ul className="space-y-2 mb-6 flex-1">
                      {pkg.features.slice(0, 4).map((feature, featureIndex) => (
                        <li
                          key={featureIndex}
                          className="flex items-center gap-2 text-sm text-gray-600"
                        >
                          <FiCheckCircle className="size-4 text-rose-400 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                      {pkg.features.length > 4 && (
                        <li className="text-sm text-rose-500 font-medium">
                          +{pkg.features.length - 4} more features
                        </li>
                      )}
                    </ul>

                    <span className="mt-auto block w-full py-3 bg-gradient-to-r from-rose-400 to-pink-500 text-white rounded-full text-center font-medium transition-all hover:shadow-lg">
                      View Details
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">
                {totalPackages === 0 &&
                !normalizedSearchQuery &&
                effectiveMinPrice === undefined &&
                effectiveMaxPrice === undefined
                  ? 'No published packages are available right now.'
                  : normalizedSearchQuery.length > 0
                    ? 'No packages found matching your search.'
                    : 'No packages found matching your criteria.'}
              </p>
            </div>
          )}
        </div>

        {!loading && totalPackages > 0 && (
          <div className="mt-10 flex justify-center">
            <div className="flex w-full max-w-3xl flex-col gap-4 rounded-[28px] border border-rose-100 bg-white/90 px-4 py-4 shadow-[0_24px_60px_-32px_rgba(244,114,182,0.45)] backdrop-blur sm:px-6">
              <div className="flex w-full flex-col gap-2 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between">
                <p>
                  Showing <span className="font-semibold text-gray-800">{visibleRangeStart}</span>-
                  <span className="font-semibold text-gray-800">{visibleRangeEnd}</span> of{' '}
                  <span className="font-semibold text-gray-800">{totalPackages}</span> packages
                </p>
                <p className="text-rose-500">
                  Page <span className="font-semibold">{activePage}</span> of{' '}
                  <span className="font-semibold">{Math.max(totalPages, 1)}</span>
                </p>
              </div>

              {totalPages > 1 && (
                <nav aria-label="Package list pagination" className="flex w-full justify-center">
                  <div className="flex w-full flex-wrap items-center justify-center gap-3 sm:justify-between">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                      disabled={activePage === 1}
                      className="inline-flex min-h-11 items-center gap-2 rounded-full border border-rose-200 bg-white px-5 text-sm font-semibold text-rose-600 shadow-sm transition hover:-translate-y-0.5 hover:border-rose-300 hover:shadow-md disabled:cursor-not-allowed disabled:border-rose-100 disabled:text-rose-300 disabled:shadow-none"
                    >
                      <FiArrowLeft className="size-4" />
                      <span>Previous</span>
                    </button>

                    <div className="flex flex-wrap items-center justify-center gap-2">
                      {paginationItems.map((item) =>
                        typeof item === 'number' ? (
                          <button
                            key={item}
                            type="button"
                            onClick={() => setCurrentPage(item)}
                            aria-current={item === activePage ? 'page' : undefined}
                            className={`flex size-11 items-center justify-center rounded-full border text-sm font-semibold transition ${
                              item === activePage
                                ? 'border-transparent bg-gradient-to-r from-rose-400 to-pink-500 text-white shadow-[0_18px_30px_-20px_rgba(236,72,153,0.85)]'
                                : 'border-rose-200 bg-white text-gray-700 shadow-sm hover:-translate-y-0.5 hover:border-rose-300 hover:text-rose-600 hover:shadow-md'
                            }`}
                          >
                            {item}
                          </button>
                        ) : (
                          <span
                            key={item}
                            aria-hidden="true"
                            className="flex size-11 items-center justify-center text-sm font-semibold text-rose-300"
                          >
                            ...
                          </span>
                        )
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                      disabled={activePage === totalPages}
                      className="inline-flex min-h-11 items-center gap-2 rounded-full border border-rose-200 bg-white px-5 text-sm font-semibold text-rose-600 shadow-sm transition hover:-translate-y-0.5 hover:border-rose-300 hover:shadow-md disabled:cursor-not-allowed disabled:border-rose-100 disabled:text-rose-300 disabled:shadow-none"
                    >
                      <span>Next</span>
                      <FiArrowRight className="size-4" />
                    </button>
                  </div>
                </nav>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
