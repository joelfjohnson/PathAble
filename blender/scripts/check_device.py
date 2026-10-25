import bpy
p=bpy.context.preferences.addons['cycles'].preferences
for backend in ['METAL','NONE']:
 try:
  p.compute_device_type=backend
  p.get_devices()
  print('PATHABLE_RENDER_DEVICES',backend,[(d.name,d.type) for d in p.devices])
 except Exception as e:print('PATHABLE_RENDER_DEVICE_ERROR',backend,str(e))
