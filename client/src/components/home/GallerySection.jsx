const gallery = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDkUb3ldk7_M5ufwWNVcE18XsWWtfKs5grLmZpphf7SSgOg-MDSUckSBa06QogJNgWpBkP-JPNytuCyq_3_jsyiiGcUxfOffpDHooXjbRnSLSjNJ2y8J3lVfdAOg9KwpxljxciK7V3TwH79vYtOXJaJP1ICo7R1N9o132M0bJeB_9fpaKEW-UjY4gNWIcb3BB6inwvttLYoi18WwGdb8Yp_FEN5uFHFwpLKJo0K46MFTenzaWhtWTsBoS84L2f6_nWKCtyOAFjDX2XB',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCHSsYTUHzZzHr3LyRrjqKrkObIW5wJRGSEDrbomsJ65jEL6ZuA_WpPsvPSCW36uHVoJAXsIEvEgPG5gcao8GapjPUH3MGCQ__RDoJVUgIv-nL81o7URGkGbo2PcDoFkkP87JluBe1r8PdTno05AI-FA6V_S1TP-gthaCgsnCdJPdAdMRcwCCVKLaCKJgOT5xe4WXBgI7QijivtamwGoSnDu_dG9KkKSOU8wwq2LBwSvJN9CHkRw3vq2bK775RIUBp7dRLdcQ8_7Wg4',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDdrClZ0cAiu5zpRSM6i8ZMvRsuRmVJm0AIfulLksh3gM7nVppHdEKAgzqxVJpkkq3XLP9xBSxn_jTGqMDzrmEP3Qz8aZkxt-YFCFoW0-i7JUtHTX_m0HOZ5NLDhD5jM5mf_x1QZtz6Ko8S6HjIv7gNXXW6Uv4iRGBmIjyyMVp-GI1aDxL2DeAROpe9djJXjvy7ICple4_NOcLu5C8BsJ5m-x9nr3TuuIdPY3NhPoO3LNsprsP3zEwCLveE60kQWFxQicvDqHNZZJJN',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCrweHRMWa0t6_5ob9XsTeCaHLTrygPWL6e1SlBTffwpCVSl9oO4MdQK7aDEna2OeDTnLVKNf2f9FtAasnwmhM3KQIuJmXlJEg0Cu-y4BWlzN1XAYcwFg1wLaMkV5ZigoXpjuB5YnaRyId7KcKYQCaXcTG9aGfR3q2T-xAtd0YQveegBXNS_tFGj5tBNgckRagPx4GL32WoeyYEJpF4geXqD8hErYf1NtzKzGlzOxCS_5aRVViZQNi5j-KsIF_UDL3Qp7WBNJhr_a75',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCe9NJte8pn84JNA6YUhqE72gd0LczC31Ex0ZeRAgYx7Q8m3uBPCx6ZeKT8dgI6IPvMbu8clL8cTz5K2f_rsCzH5u4IpFIdLNI0HhJZj9hxwIRsycNh1QjfHT8fmkQO57ytPQTt32Ga9Zswk00d5GfGO2v7bTg_JG2M6E-G2CIR5fUdQFULnI-oqr8qGueQf29GqRghR1fFno_yTYg6ozB9L34eaRvfDzoX6W88agA1q7AkCdAPmr9tgBTlz9LHb2qvfN1kGayY2npk',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDH7yt14gYp3JEwXcvj1kPxpXUdpVtsIfzNQxj6PAAoi86f_Mh5XNrilqE8aZN6jSClGz4RMNg1-6me7vB7LRjrrjXEojJEMyhqHjFHdTIuL6FINvOAo3KdQ9iDkieSk83GgWQpRsegm1U_I3_V56mswccVOLFsJPT4TLjBKpyDjXLdk2Vyh7h-Ii-jzDUw67eO7YGY0X5zPVO5XeOdMp3ukNyEdTxKXInQj0jB42jMJodOUt8L9PgWdDU3an9Ln_wUCdRWNvtUjFmc',
];

export default function GallerySection() {
  return (
    <section className="py-xxl px-margin-mobile md:px-margin-desktop" id="gallery">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-playfair text-headline-lg text-center mb-xxl reveal">
          Artisan Portfolio
        </h2>
        <div className="masonry reveal">
          {gallery.map((src, i) => (
            <div key={i} className="masonry-item overflow-hidden rounded-xl group cursor-pointer">
              <img src={src} alt={`Gallery piece ${i + 1}`}
                className="rounded-xl w-full object-cover group-hover:scale-105 transition-transform duration-700" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
