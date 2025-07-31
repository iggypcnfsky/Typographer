'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useMotionStore } from '@/lib/store/motion-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Copy, 
  Trash2,
  Edit3,
  Check,
  X
} from 'lucide-react';
import { EasingCurve } from '@/types/motion';

export function EasingCurveEditor() {
  const { 
    easingCurves, 
    customEasingCurves, 
    settings,
    createEasingCurve, 
    updateEasingCurve, 
    deleteEasingCurve,
    duplicateEasingCurve,
    updateMotion
  } = useMotionStore();


  const [isCreating, setIsCreating] = useState(false);
  const [editingName, setEditingName] = useState<string | null>(null);
  const [newCurveName, setNewCurveName] = useState('');
  const [customCurve, setCustomCurve] = useState<[number, number, number, number]>([0.25, 0.1, 0.25, 1]);
  
  const svgRef = useRef<SVGSVGElement>(null);
  const isDragging = useRef<'cp1' | 'cp2' | null>(null);

  const allCurves = [...easingCurves, ...customEasingCurves];

  // Handle SVG mouse events for interactive bezier curve editing
  const handleMouseDown = useCallback((e: React.MouseEvent, controlPoint: 'cp1' | 'cp2') => {
    e.preventDefault();
    isDragging.current = controlPoint;
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current || !svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = 1 - (e.clientY - rect.top) / rect.height;

    // Constrain to valid ranges
    const constrainedX = Math.max(0, Math.min(1, x));
    const constrainedY = Math.max(-0.5, Math.min(1.5, y));

    const newCurve = [...customCurve] as [number, number, number, number];
    
    if (isDragging.current === 'cp1') {
      newCurve[0] = constrainedX;
      newCurve[1] = constrainedY;
    } else {
      newCurve[2] = constrainedX;
      newCurve[3] = constrainedY;
    }

    setCustomCurve(newCurve);
  }, [customCurve]);

  const handleMouseUp = useCallback(() => {
    isDragging.current = null;
  }, []);

  // Add global mouse events
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging.current && svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = 1 - (e.clientY - rect.top) / rect.height;

        const constrainedX = Math.max(0, Math.min(1, x));
        const constrainedY = Math.max(-0.5, Math.min(1.5, y));

        const newCurve = [...customCurve] as [number, number, number, number];
        
        if (isDragging.current === 'cp1') {
          newCurve[0] = constrainedX;
          newCurve[1] = constrainedY;
        } else {
          newCurve[2] = constrainedX;
          newCurve[3] = constrainedY;
        }

        setCustomCurve(newCurve);
      }
    };

    const handleGlobalMouseUp = () => {
      isDragging.current = null;
    };

    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [customCurve]);

  const handleCreateCurve = () => {
    if (!newCurveName.trim()) return;
    
    createEasingCurve({
      name: newCurveName.trim(),
      description: `Custom easing curve`,
      cubicBezier: customCurve,
      type: 'custom'
    });
    
    setNewCurveName('');
    setIsCreating(false);
    setCustomCurve([0.25, 0.1, 0.25, 1]);
  };

  const handleDuplicateCurve = (curve: EasingCurve) => {
    const newName = `${curve.name} Copy`;
    duplicateEasingCurve(curve.id, newName);
  };

  const handleSetAsDefault = (curveId: string) => {
    updateMotion({ defaultEasing: curveId });
  };

  const handleEditName = (curve: EasingCurve, newName: string) => {
    if (curve.type === 'custom' && newName.trim()) {
      updateEasingCurve(curve.id, { name: newName.trim() });
    }
    setEditingName(null);
  };

  // Generate SVG path for curve visualization
  const generateCurvePath = (curve: [number, number, number, number]) => {
    const [x1, y1, x2, y2] = curve;
    return `M 0 100 C ${x1 * 100} ${100 - y1 * 100} ${x2 * 100} ${100 - y2 * 100} 100 0`;
  };

  return (
    <div className="space-y-6">
      {/* Current Default Easing */}
      <div>
        <Label className="text-sm font-medium text-foreground mb-3 block">
          Default Easing Curve
        </Label>
        <div className="p-3 bg-muted/30 rounded-lg border border-border">
          {(() => {
            const defaultCurve = allCurves.find(c => c.id === settings.defaultEasing);
            return defaultCurve ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{defaultCurve.name}</p>
                  <p className="text-xs text-muted-foreground">{defaultCurve.description}</p>
                </div>
                <div className="w-16 h-16">
                  <svg width="64" height="64" viewBox="0 0 100 100" className="border border-border rounded">
                    <path 
                      d={generateCurvePath(defaultCurve.cubicBezier)} 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2"
                    />
                  </svg>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No default curve selected</p>
            );
          })()}
        </div>
      </div>

      {/* Built-in Easing Curves */}
      <div>
        <Label className="text-sm font-medium text-foreground mb-3 block">
          Built-in Curves
        </Label>
        <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
          {easingCurves.map((curve) => (
            <div
              key={curve.id}
              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                settings.defaultEasing === curve.id
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-muted-foreground bg-card'
              }`}
              onClick={() => handleSetAsDefault(curve.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-sm">{curve.name}</p>
                  <p className="text-xs text-muted-foreground">{curve.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDuplicateCurve(curve);
                    }}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <div className="w-12 h-12">
                    <svg width="48" height="48" viewBox="0 0 100 100" className="border border-border rounded">
                      <path 
                        d={generateCurvePath(curve.cubicBezier)} 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Easing Curves */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <Label className="text-sm font-medium text-foreground">
            Custom Curves
          </Label>
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-3 w-3 mr-1" />
                Create
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Custom Easing Curve</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="curve-name">Curve Name</Label>
                  <Input
                    id="curve-name"
                    value={newCurveName}
                    onChange={(e) => setNewCurveName(e.target.value)}
                    placeholder="Enter curve name..."
                  />
                </div>
                
                {/* Interactive Bezier Curve Editor */}
                <div>
                  <Label>Bezier Curve Editor</Label>
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <svg
                      ref={svgRef}
                      width="300"
                      height="200"
                      viewBox="0 0 100 100"
                      className="border border-border rounded bg-background cursor-crosshair"
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                    >
                      {/* Grid */}
                      <defs>
                        <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                          <path d="M 10 0 L 0 0 0 10" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5"/>
                        </pattern>
                      </defs>
                      <rect width="100" height="100" fill="url(#grid)" opacity="0.3"/>
                      
                      {/* Bezier curve */}
                      <path
                        d={generateCurvePath(customCurve)}
                        fill="none"
                        stroke="hsl(var(--primary))"
                        strokeWidth="2"
                      />
                      
                      {/* Control lines */}
                      <line
                        x1="0" y1="100"
                        x2={customCurve[0] * 100} y2={100 - customCurve[1] * 100}
                        stroke="hsl(var(--muted-foreground))"
                        strokeWidth="1"
                        strokeDasharray="2,2"
                      />
                      <line
                        x1="100" y1="0"
                        x2={customCurve[2] * 100} y2={100 - customCurve[3] * 100}
                        stroke="hsl(var(--muted-foreground))"
                        strokeWidth="1"
                        strokeDasharray="2,2"
                      />
                      
                      {/* Control points */}
                      <circle
                        cx={customCurve[0] * 100}
                        cy={100 - customCurve[1] * 100}
                        r="4"
                        fill="hsl(var(--primary))"
                        className="cursor-grab active:cursor-grabbing"
                        onMouseDown={(e) => handleMouseDown(e, 'cp1')}
                      />
                      <circle
                        cx={customCurve[2] * 100}
                        cy={100 - customCurve[3] * 100}
                        r="4"
                        fill="hsl(var(--primary))"
                        className="cursor-grab active:cursor-grabbing"
                        onMouseDown={(e) => handleMouseDown(e, 'cp2')}
                      />
                      
                      {/* Start and end points */}
                      <circle cx="0" cy="100" r="3" fill="hsl(var(--accent-foreground))"/>
                      <circle cx="100" cy="0" r="3" fill="hsl(var(--accent-foreground))"/>
                    </svg>
                    
                    <div className="mt-3 grid grid-cols-4 gap-2 text-xs">
                      <div>
                        <Label>X1</Label>
                        <Input
                          type="number"
                          value={customCurve[0].toFixed(2)}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setCustomCurve([val, customCurve[1], customCurve[2], customCurve[3]]);
                          }}
                          step={0.01}
                          min={0}
                          max={1}
                          className="h-7"
                        />
                      </div>
                      <div>
                        <Label>Y1</Label>
                        <Input
                          type="number"
                          value={customCurve[1].toFixed(2)}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setCustomCurve([customCurve[0], val, customCurve[2], customCurve[3]]);
                          }}
                          step={0.01}
                          min={-0.5}
                          max={1.5}
                          className="h-7"
                        />
                      </div>
                      <div>
                        <Label>X2</Label>
                        <Input
                          type="number"
                          value={customCurve[2].toFixed(2)}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setCustomCurve([customCurve[0], customCurve[1], val, customCurve[3]]);
                          }}
                          step={0.01}
                          min={0}
                          max={1}
                          className="h-7"
                        />
                      </div>
                      <div>
                        <Label>Y2</Label>
                        <Input
                          type="number"
                          value={customCurve[3].toFixed(2)}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setCustomCurve([customCurve[0], customCurve[1], customCurve[2], val]);
                          }}
                          step={0.01}
                          min={-0.5}
                          max={1.5}
                          className="h-7"
                        />
                      </div>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mt-2">
                      CSS: cubic-bezier({customCurve.join(', ')})
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreating(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateCurve} disabled={!newCurveName.trim()}>
                    Create Curve
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-2 max-h-40 overflow-y-auto">
          {customEasingCurves.length === 0 ? (
            <div className="text-center text-muted-foreground py-4 text-sm">
              No custom curves yet. Create one to get started.
            </div>
          ) : (
            customEasingCurves.map((curve) => (
              <div
                key={curve.id}
                className={`p-3 rounded-lg border transition-colors ${
                  settings.defaultEasing === curve.id
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-muted-foreground bg-card'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 cursor-pointer" onClick={() => handleSetAsDefault(curve.id)}>
                    {editingName === curve.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={curve.name}
                          onChange={(e) => updateEasingCurve(curve.id, { name: e.target.value })}
                          className="h-6 text-sm"
                          autoFocus
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleEditName(curve, curve.name)}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => setEditingName(null)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <p className="font-medium text-sm">{curve.name}</p>
                        <p className="text-xs text-muted-foreground">{curve.description}</p>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setEditingName(curve.id)}
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleDuplicateCurve(curve)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive"
                      onClick={() => deleteEasingCurve(curve.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                    <div className="w-12 h-12">
                      <svg width="48" height="48" viewBox="0 0 100 100" className="border border-border rounded">
                        <path 
                          d={generateCurvePath(curve.cubicBezier)} 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}