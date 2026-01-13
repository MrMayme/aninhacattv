type AuditChanges = Record< string, { old: unknown, new: unknown  } >

export function buildUCreateAuditChanges(newData: Record<string, any>): AuditChanges {

  const changes = {
    created: {
      old: null,
      new: newData
    }
  }

  return changes
}

export function buildUpdateAuditChanges(oldData: Record<string, any>, newData: Record<string, any>): AuditChanges {
  console.log("1->buildUpdateAuditChanges: ", newData)  
  const changes: AuditChanges = {}

  for (const key of Object.keys(newData)) {
    if (oldData[key] !== newData[key]) {
      changes[key] = {
        old: oldData[key],
        new: newData[key],
      }
    }
  }
  console.log("2->buildUpdateAuditChanges: ", changes)
  return changes
}

export function buildDeleteAuditChanges(oldData: Record<string, any>): AuditChanges {
    
  const changes = {
    created: {
      old: oldData,
      new: null
    }
  }

  return changes
}