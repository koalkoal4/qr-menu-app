'use client'

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Category } from '@/lib/types';
import CategoryForm from '@/components/CategoryForm';

export default function CategoryEditPage() {
  const router = useRouter();
  const { id } = useParams();
  const supabase = createClientComponentClient();
  const [category, setCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch category
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('*')
          .eq('id', id)
          .single();
        
        if (categoryError) throw categoryError;
        setCategory(categoryData);
      } catch (error) {
        console.error('Error fetching category:', error);
        setError('Failed to load category data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [supabase, id]);

  const handleSave = async (categoryData: Omit<Category, 'id'>) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({ ...categoryData, id: Number(id) })
        .eq('id', id);
      
      if (error) throw error;
      
      router.push('/admin');
    } catch (error) {
      console.error('Error updating category:', error);
      setError('Failed to update category');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading category...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Category not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Edit Category</h1>
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900"
          >
            &larr; Back
          </button>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <CategoryForm 
            initialData={category} 
            onSave={handleSave} 
          />
        </div>
      </div>
    </div>
  );
}