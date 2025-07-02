'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Category, Profile } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

function MenuHeader({ profile }: { profile: Profile | null }) {
    // Skeleton bileşeninden de rounded-lg sınıfını kaldırıyoruz
    if (!profile) {
        return <Skeleton className="w-full h-48 mb-6" />;
    }
    
    const coverImageUrl = profile.cover_image_url
        ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/cover-images/${profile.cover_image_url}`
        : null; // Varsayılan görsel olarak null kullanmak daha iyi, yoksa hiç göstermeyiz

    // Kapak resmi yoksa bileşeni render etmiyoruz
    if (!coverImageUrl) {
        return null;
    }

    return (
        // Bu div'den artık kenar yuvarlaklığı ve ekstra boşluklar kaldırıldı
        <div className="relative mb-6">
            <div className="w-full h-80 overflow-hidden"> {/* rounded-lg kaldırıldı */}
                <Image src={coverImageUrl} alt="Restaurant Cover" fill className="object-cover"/>
            </div>
            {profile.instagram_url && (
                <a href={profile.instagram_url} target="_blank" rel="noopener noreferrer" className="absolute top-3 right-3 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors">
                    {/* --- GÜNCELLEME: Inline SVG, Image bileşeni ile değiştirildi --- */}
                    <Image
                        src="/icons/instagram.svg" // public klasöründeki dosya yolu
                        alt="Instagram"
                        width={20} // w-5 sınıfına karşılık gelir
                        height={20} // h-5 sınıfına karşılık gelir
                    />
                </a>
            )}
        </div>
    );
}

function CategoryCard({ category }: { category: Category }) {
  const imageUrl = category.image_url
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/category-images/${category.image_url}`
    : null;

  return (
    <Link href={`/menu#category-${category.id}`} className="block group">
      <div className="relative overflow-hidden rounded-lg shadow-lg bg-surface dark:bg-dark-surface">
        <div className="w-full aspect-square">
          {imageUrl && (
            <Image
              alt={category.name}
              src={imageUrl}
              width={400}
              height={400}
              className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-110"
            />
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end">
          <h2 className="p-4 text-xl font-bold text-white">
            {category.name}
          </h2>
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const supabase = createClientComponentClient();
  const [categories, setCategories] = useState<Category[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      const [catRes, profileRes] = await Promise.all([
        supabase.from('categories').select('*').eq('is_available', true).order('display_order', { ascending: true }),
        supabase.from('profiles').select('*').single()
      ]);

      if (catRes.error) console.error("Error fetching categories:", catRes.error);
      if (profileRes.error) console.error("Error fetching profile:", profileRes.error);

      setCategories(catRes.data || []);
      setProfile(profileRes.data || null);
      setIsLoading(false);
    };

    fetchInitialData();
  }, [supabase]);

  return (
    // Ana div'den 'p-4' sınıfı kaldırıldı.
    <div>
      <MenuHeader profile={profile} />
      
      {/* Kalan içeriğe boşluk vermek için yeni bir div eklendi */}
      <div className="p-4">
        <header className="text-center mb-8">
            <h1 className="text-4xl font-extrabold tracking-tight">Menümüz</h1>
            <p className="text-secondary mt-2">Lezzetlerimizi keşfetmek için bir kategori seçin</p>
        </header>
        
        <div className="grid grid-cols-2 gap-4">
            {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="w-full aspect-square rounded-lg" />
            ))
            ) : (
            categories.map(category => (
                <CategoryCard key={category.id} category={category} />
            ))
            )}
        </div>
      </div>
    </div>
  );
}