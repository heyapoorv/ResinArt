import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { categoriesApi } from '../../api/categories.api.js';

// Fallback category images
const catImages = {
  'Clocks':          'https://lh3.googleusercontent.com/aida-public/AB6AXuDv7LkNYggmfn-HXCMJVsRvGJAVeV7iCstDJ_J3iXxzRLpJQVQOyI87tZpNQA9AR-l8EAhZ4fC60rdqsP-nSDh702Rx5n4fQLI4sCIZ28ANBWJTXCKXEiqRUbrL8qUVIruEHhGkmq3LFoYK-L87Q8j71tUCUepdvsE-QhZTzBiM982BFZxfTpWhdSqFtIazdInmDwT2hMkutA1JU_PKLtN4RWMXNf3AXQeJziNZARR5KmfWAUUAHwmRuatdg_8STM_OiPONjQl8aBWD',
  'Coasters':        'https://lh3.googleusercontent.com/aida-public/AB6AXuCl7ryB5KX71IoApzMrVaqn-owmpx2XSLJb8uNOhvf1EjIQV1p2ZAHL380QPXfzlvaS3z-2lBMRbVXl2ipnmrJs-ZDJW0ygw_UEBkElT0noI5jQDvfiuI6DwjKprT0G8H7q38awMRsevtCGFdfcsFyzQR6kv9zlkrnNuup1GQZYlKXHYDGGunHMDSny0LtcBhBq3hawK2pEofZ3RtrU-wgzOhCQ4-DCjdXch_Fmp6MAdySNx4Q3eLHd3rQCp78QspotIV4tVjYq8GVT',
  'Home Decor':      'https://lh3.googleusercontent.com/aida-public/AB6AXuAcvV9PadppLsjCw5dgQGT7z2kd2Mo4ke_WcxfXccDVU0OZgdlbf9iG4PaGhDsp9LhriYFCtAHL6vqXqyOGgE8LjoA_nRp42OV_nnq_orEJTMiKpXjLRWnK2WSbHbZYAUyni60scF1A3fYbzqX8bjJQyXOAgXMbZsAaaq-_DziWzTPUnUHDTNSOE7EPtQ7O95T0Hj7tztXoQNmTHki0Ton_s5AdxuV8wqbMrFScDgq5M8lP8AiD85W_4z8s-b9VSwJnnmqFiP4IvabM',
  'Wearables':       'https://lh3.googleusercontent.com/aida-public/AB6AXuCLG0i20qGKgOWFUE9M5vHCQKtvCgEJOthh_N1aOqyelQwI9Jz_YOTnDevTVLeqgg5EgfnXwg6T2w9-rLxCm4wGz41kHMfIS8IyH4oYVlsYkME8tROGctqaCW3Lu1vozdMMOKObZ5jhdjnup0OGmeRC58VMWaEoIxz9-B8nl3wcw3wD5K6v7puV-Wz5oqEYEri2mGSZKHFa6lvAcuin0kH75lqTGtcgcj2kVHhApRBV-vXj0_a53S-zsP4akzdG4Q78HGHL6Vv-ph_G',
  'Luxury Trays':    'https://lh3.googleusercontent.com/aida-public/AB6AXuBYPQXipQ9DhVowUIyVk6w6nN4zDAt0QU5_2KYpWzixG1oc6EjBxg_JKI6dF3UiI75m5k4dGtlpqtqxuqbQP7qKwL1OlVdopp3BfOlSnoByt3YuHDCE2Vg3gucNcxr1ItIu8sShEvLGolfy63oNs_7lkgQwi09Cxmj2YBYrMPmjgj8-JCmwS0u6cEgbFSeZgB4B7vkWdAXFsAjYhE5Y4pepxw8AB45FLkkl5S2fbpvAdG0UDVyUOcP5SKzV1GdAZE7dTT9nW32zoWeJ',
};

const defaultImg = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDv7LkNYggmfn-HXCMJVsRvGJAVeV7iCstDJ_J3iXxzRLpJQVQOyI87tZpNQA9AR-l8EAhZ4fC60rdqsP-nSDh702Rx5n4fQLI4sCIZ28ANBWJTXCKXEiqRUbrL8qUVIruEHhGkmq3LFoYK-L87Q8j71tUCUepdvsE-QhZTzBiM982BFZxfTpWhdSqFtIazdInmDwT2hMkutA1JU_PKLtN4RWMXNf3AXQeJziNZARR5KmfWAUUAHwmRuatdg_8STM_OiPONjQl8aBWD';

export default function CategoryBento() {
  const { data } = useQuery({
    queryKey: ['categories'],
    queryFn:  () => categoriesApi.getAll().then((d) => d.data),
  });

  const cats = (data || []).filter((c) => c.productCount > 0).slice(0, 5);

  if (!cats.length) return null;

  return (
    <section className="py-xxl px-margin-mobile md:px-margin-desktop bg-surface-container-lowest">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-playfair text-headline-lg text-center mb-xxl reveal">
          Explore Our World
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 grid-rows-2 gap-sm h-[600px] md:h-[500px] reveal">
          {/* Large first cell */}
          {cats.slice(0, 1).map((cat) => (
            <Link key={cat._id} to={`/collection?category=${cat._id}&name=${encodeURIComponent(cat.name)}`}
              className="col-span-2 row-span-1 rounded-xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url('${catImages[cat.name] || defaultImg}')` }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-lg left-lg">
                <h3 className="text-white font-playfair text-headline-md">{cat.name}</h3>
                <p className="text-white/80 font-inter text-caption">{cat.productCount} pieces</p>
              </div>
            </Link>
          ))}

          {/* Smaller cells */}
          {cats.slice(1).map((cat) => (
            <Link key={cat._id} to={`/collection?category=${cat._id}&name=${encodeURIComponent(cat.name)}`}
              className="col-span-1 row-span-1 rounded-xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url('${catImages[cat.name] || defaultImg}')` }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-md left-md">
                <h3 className="text-white font-playfair text-headline-md leading-tight">{cat.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
