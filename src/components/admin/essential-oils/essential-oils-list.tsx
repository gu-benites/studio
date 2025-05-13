'use client';

import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Edit, Eye, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

type EssentialOil = {
  id: string;
  name_english: string;
  name_scientific: string;
  name_portuguese: string;
  general_description?: string;
  created_at: string;
  updated_at: string;
  similarity?: number; // For semantic search results
};

type EssentialOilsListProps = {
  essentialOils: EssentialOil[];
  isLoading: boolean;
};

export function EssentialOilsList({ 
  essentialOils = [], 
  isLoading = false, 
  onDelete 
}: EssentialOilsListProps & { onDelete?: (id: string) => Promise<void> }) {
  // Check if any oil has a similarity score (meaning it's from semantic search)
  const isSemanticResult = essentialOils.length > 0 && essentialOils.some(oil => typeof oil.similarity === 'number');
  
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const handleDeleteConfirm = async () => {
    if (onDelete && deleteId) {
      await onDelete(deleteId);
      setDeleteId(null);
    }
  };
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Name (English)</TableHead>
            <TableHead className="hidden md:table-cell">Scientific Name</TableHead>
            <TableHead className="hidden lg:table-cell">Portuguese Name</TableHead>
            {isSemanticResult && <TableHead className="hidden md:table-cell w-[100px]">Relevance</TableHead>}
            <TableHead className="hidden md:table-cell w-[120px]">Last Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && (
            <>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-full" /></TableCell>
                  <TableCell className="hidden lg:table-cell"><Skeleton className="h-5 w-full" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Skeleton className="h-9 w-9" />
                      <Skeleton className="h-9 w-9" />
                      <Skeleton className="h-9 w-9" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </>
          )}
          
          {!isLoading && essentialOils.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No essential oils found. 
                <Button variant="link" asChild className="p-0 pl-1">
                  <Link href="/admin/essential-oils/new">Add your first essential oil</Link>
                </Button>
              </TableCell>
            </TableRow>
          )}
          
          {!isLoading && essentialOils.map((oil) => (
            <TableRow key={oil.id}>
              <TableCell className="font-medium">{oil.name_english}</TableCell>
              <TableCell className="hidden md:table-cell">
                <span className="italic">{oil.name_scientific}</span>
              </TableCell>
              <TableCell className="hidden lg:table-cell">{oil.name_portuguese}</TableCell>
              {isSemanticResult && (
                <TableCell className="hidden md:table-cell">
                  {oil.similarity !== undefined ? (
                    <div className="flex items-center">
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary" 
                          style={{ width: `${Math.min(oil.similarity * 100, 100)}%` }}
                        />
                      </div>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {Math.round(oil.similarity * 100)}%
                      </span>
                    </div>
                  ) : "-"}
                </TableCell>
              )}
              <TableCell className="hidden md:table-cell text-muted-foreground">
                {formatTimeAgo(oil.updated_at)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/admin/essential-oils/${oil.id}`}>
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View</span>
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/admin/essential-oils/${oil.id}`}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Link>
                  </Button>
                  <AlertDialog open={deleteId === oil.id}>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(oil.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the essential oil
                          &quot;{oil.name_english}&quot; from the database.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeleteId(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleDeleteConfirm}
                          variant="destructive"
                        >Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// Helper function to format timestamps
function formatTimeAgo(timestamp: string): string {
  if (!timestamp) return 'Unknown';
  
  try {
    const date = new Date(timestamp);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
}
