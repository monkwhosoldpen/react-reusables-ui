import { ScrollView } from 'react-native';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import { Text } from '~/components/ui/text';
import { FormDataType } from '~/lib/enhanced-chat/types/superfeed';
import { FeedItem } from './FeedItem';

interface PreviewDialogProps {
  data: FormDataType;
  triggerText?: string;
}

export function PreviewDialog({ data, triggerText = 'Preview' }: PreviewDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Text>{triggerText}</Text>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] h-[80vh]">
        <DialogHeader>
          <DialogTitle>Preview Content</DialogTitle>
          <DialogDescription>
            This is how your content will appear in the feed
          </DialogDescription>
        </DialogHeader>

        <ScrollView className="flex-1">
          <FeedItem 
            data={data} 
            showHeader={true} 
            showFooter={true}
          />
        </ScrollView>

        <DialogFooter>
          <DialogClose asChild>
            <Button>
              <Text>Close</Text>
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 