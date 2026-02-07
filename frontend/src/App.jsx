import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'

function App() {
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button>Open Drawer</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Shadcn UI Test</DrawerTitle>
            <DrawerDescription>
              This is a test drawer to verify shadcn/ui is working correctly.
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4">
            <p className="text-sm text-muted-foreground">
              If you can see this, shadcn/ui components are working! 🎉
            </p>
          </div>
          <DrawerFooter>
            <Button onClick={() => setOpen(false)}>Close</Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}

export default App
