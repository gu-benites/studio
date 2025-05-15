import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface OilFormHeaderProps {
  oilId?: string;
}

export const OilFormHeader: React.FC<OilFormHeaderProps> = ({ oilId }) => {
  const router = useRouter();
  const title = oilId ? "Edit Essential Oil" : "Add New Essential Oil";

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{title}</h1>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => router.push('/admin/essential-oils')}>
              Cancel
            </Button>
            <Button type="submit" form="oil-form">
              {oilId ? 'Save Changes' : 'Create Oil'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
