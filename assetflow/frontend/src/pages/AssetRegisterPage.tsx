import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { useToast } from '../contexts/ToastContext';
import assetService from '../services/asset.service';
import departmentService from '../services/department.service';
import categoryService from '../services/category.service';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import Textarea from '../components/ui/Textarea';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { ArrowLeft, Upload, FileText, Image as ImageIcon } from 'lucide-react';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  categoryId: z.string().min(1, 'Please select a category'),
  departmentId: z.string().optional().nullable(),
  serialNumber: z.string().optional(),
  condition: z.enum(['NEW', 'GOOD', 'FAIR', 'POOR', 'DAMAGED']),
  location: z.string().optional(),
  description: z.string().optional(),
  acquisitionDate: z.string().optional(),
  acquisitionCost: z.string().optional(),
  bookable: z.boolean().default(false),
});

type FormDataFields = z.infer<typeof schema>;

export default function AssetRegisterPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [photo, setPhoto] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch select list options
  const { data: depts } = useApi<any>(() => departmentService.getAllDepartments({ limit: 100 }));
  const { data: cats } = useApi<any>(() => categoryService.getAllCategories({ limit: 100 }));

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormDataFields>({
    resolver: zodResolver(schema),
    defaultValues: {
      condition: 'NEW',
      bookable: false,
    },
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };

  const onSubmit = async (data: FormDataFields) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('categoryId', data.categoryId);
      formData.append('condition', data.condition);
      formData.append('bookable', String(data.bookable));

      if (data.departmentId) formData.append('departmentId', data.departmentId);
      if (data.serialNumber) formData.append('serialNumber', data.serialNumber);
      if (data.location) formData.append('location', data.location);
      if (data.description) formData.append('description', data.description);
      if (data.acquisitionDate) formData.append('acquisitionDate', data.acquisitionDate);
      if (data.acquisitionCost) formData.append('acquisitionCost', data.acquisitionCost);

      if (photo) {
        formData.append('photo', photo);
      }

      await assetService.registerAsset(formData);
      showToast('Asset registered successfully', 'success');
      navigate('/assets');
    } catch (error: any) {
      showToast(error.response?.data?.message || error.message || 'Failed to register asset', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const categoryOptions = cats
    ? [{ value: '', label: '-- Select Category --' }, ...cats.map((c: any) => ({ value: c.id, label: c.name }))]
    : [{ value: '', label: '-- Select Category --' }];

  const departmentOptions = depts
    ? [{ value: '', label: '-- Select Department --' }, ...depts.map((d: any) => ({ value: d.id, label: d.name }))]
    : [{ value: '', label: '-- Select Department --' }];

  const conditionOptions = [
    { value: 'NEW', label: 'New / Unopened' },
    { value: 'GOOD', label: 'Good' },
    { value: 'FAIR', label: 'Fair' },
    { value: 'POOR', label: 'Poor' },
    { value: 'DAMAGED', label: 'Damaged' },
  ];

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/assets"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-surface-500 hover:text-brand-600 transition"
        >
          <ArrowLeft size={16} />
          <span>Back to Assets</span>
        </Link>
      </div>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Register Corporate Asset</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Asset Name"
                placeholder="e.g. MacBook Pro M3"
                error={errors.name?.message}
                disabled={isLoading}
                {...register('name')}
              />

              <Select
                label="Asset Category"
                options={categoryOptions}
                error={errors.categoryId?.message}
                disabled={isLoading}
                {...register('categoryId')}
              />

              <Select
                label="Assigned Department"
                options={departmentOptions}
                error={errors.departmentId?.message}
                disabled={isLoading}
                {...register('departmentId')}
              />

              <Input
                label="Serial Number (Optional)"
                placeholder="e.g. C02X8747LVC2"
                error={errors.serialNumber?.message}
                disabled={isLoading}
                {...register('serialNumber')}
              />

              <Select
                label="Initial Condition"
                options={conditionOptions}
                error={errors.condition?.message}
                disabled={isLoading}
                {...register('condition')}
              />

              <Input
                label="Storage / Office Location"
                placeholder="e.g. Floor 2, Server Room A"
                error={errors.location?.message}
                disabled={isLoading}
                {...register('location')}
              />

              <Input
                label="Acquisition Date (Optional)"
                type="date"
                error={errors.acquisitionDate?.message}
                disabled={isLoading}
                {...register('acquisitionDate')}
              />

              <Input
                label="Acquisition Cost (USD)"
                type="number"
                step="0.01"
                placeholder="e.g. 2499.00"
                error={errors.acquisitionCost?.message}
                disabled={isLoading}
                {...register('acquisitionCost')}
              />
            </div>

            <Textarea
              label="Description (Optional)"
              placeholder="Technical specifications, components list, and warranty details..."
              error={errors.description?.message}
              disabled={isLoading}
              {...register('description')}
            />

            {/* Bookable checkbox */}
            <div className="flex items-center gap-2 p-3 bg-surface-50 border border-surface-200/60 rounded-xl max-w-sm">
              <input
                id="bookable"
                type="checkbox"
                className="h-4.5 w-4.5 text-brand-600 focus:ring-brand-500 border-surface-300 rounded cursor-pointer"
                disabled={isLoading}
                {...register('bookable')}
              />
              <label htmlFor="bookable" className="text-sm font-semibold text-surface-700 cursor-pointer">
                Allow hourly bookings / reservations
              </label>
            </div>

            {/* Photo upload component */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-surface-700">Asset Photo</label>
              <div className="border border-dashed border-surface-300 bg-surface-50/50 hover:bg-surface-50 p-6 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                  id="photo-upload"
                  disabled={isLoading}
                />
                <label htmlFor="photo-upload" className="flex flex-col items-center cursor-pointer">
                  {photo ? (
                    <>
                      <ImageIcon size={32} className="text-brand-600 mb-2" />
                      <span className="text-sm font-bold text-surface-900 truncate max-w-xs">{photo.name}</span>
                      <span className="text-xs text-surface-400 mt-1">Click to re-select file</span>
                    </>
                  ) : (
                    <>
                      <Upload size={32} className="text-surface-400 mb-2" />
                      <span className="text-sm font-bold text-surface-900">Upload Image File</span>
                      <span className="text-xs text-surface-400 mt-1">JPEG, PNG, WEBP up to 5MB</span>
                    </>
                  )}
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-surface-100">
              <Button type="button" variant="outline" onClick={() => navigate('/assets')} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isLoading}>
                Register Asset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
