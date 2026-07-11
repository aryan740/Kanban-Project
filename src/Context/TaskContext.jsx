/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const TaskContext = createContext();

const initialState = {
  tasks: [],
  searchQuery: '',
  filters: { priority: 'all' }
};

function taskReducer(state, action) {
  switch (action.type) {
    case 'SET_TASKS':
      return { ...state, tasks: action.payload };
      
    case 'CREATE_TASK': {
      // Automatic rich log generation during creation phase
      const enrichedTask = {
        ...action.payload,
        isDeleted: false,
        deletedAt: null,
        logs: [{
          timestamp: new Date().toISOString(),
          user: action.payload.operator || 'Authorized Operator',
          action: 'INITIALIZATION',
          details: 'Created core action ticket node.'
        }]
      };
      return { ...state, tasks: [...state.tasks, enrichedTask] };
    }

    case 'EDIT_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task => {
          if (task.id === action.payload.id) {
            // Check matching differences to see what mutated
            const changes = [];
            if (task.title !== action.payload.title) changes.push('Title');
            if (task.description !== action.payload.description) changes.push('Description');
            if (task.priority !== action.payload.priority) changes.push('Priority Level');
            
            // Checking if checklist item counts mutated
            const oldSubs = task.subtasks || [];
            const newSubs = action.payload.subtasks || [];
            if (oldSubs.length !== newSubs.length) changes.push('Checklist items count');

            const logDetails = changes.length > 0 
              ? `Mutated core properties: [${changes.join(', ')}].`
              : 'Adjusted nested checklist matrix attributes.';

            return {
              ...action.payload,
              logs: [
                ...(task.logs || []),
                {
                  timestamp: new Date().toISOString(),
                  user: action.payload.operator || 'Authorized Operator',
                  action: 'METADATA_UPDATE',
                  details: logDetails
                }
              ]
            };
          }
          return task;
        })
      };

    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task => {
          if (task.id === action.payload.id) {
            return {
              ...task,
              isDeleted: true,
              deletedAt: new Date().toISOString(),
              logs: [
                ...(task.logs || []),
                {
                  timestamp: new Date().toISOString(),
                  user: action.payload.operator || 'Authorized Operator',
                  action: 'SOFT_DELETE',
                  details: 'Soft delete flagged. 48-Hour retention lease initiated.'
                }
              ]
            };
          }
          return task;
        })
      };

    case 'RESTORE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task => {
          if (task.id === action.payload.id) {
            return {
              ...task,
              isDeleted: false,
              deletedAt: null,
              logs: [
                ...(task.logs || []),
                {
                  timestamp: new Date().toISOString(),
                  user: action.payload.operator || 'Authorized Operator',
                  action: 'WORKSPACE_RECOVERY',
                  details: 'Restored node from recovery retention log layer.'
                }
              ]
            };
          }
          return task;
        })
      };

    case 'UPDATE_TASK_STATUS':
      return {
        ...state,
        tasks: state.tasks.map(task => {
          if (task.id === action.payload.id) {
            const oldStatus = task.status || 'backlog';
            const newStatus = action.payload.newStatus;
            
            // Avoid duplicate log if dropped into the same column
            if (oldStatus === newStatus) return task;

            return {
              ...task,
              status: newStatus,
              logs: [
                ...(task.logs || []),
                {
                  timestamp: new Date().toISOString(),
                  user: action.payload.operator || 'Authorized Operator',
                  action: 'PIPELINE_SHIFT',
                  details: `Transitioned status vector from [${oldStatus}] to [${newStatus}].`
                }
              ]
            };
          }
          return task;
        })
      };

    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
      
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
      
    default:
      return state;
  }
}

export function TaskProvider({ children }) {
  const [state, dispatch] = useReducer(taskReducer, initialState);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Listen to Real-time Auth Lifecycle Sessions
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Fetch User-Isolated Board Records from Postgres Cloud
  useEffect(() => {
    if (!user) return;

    const fetchUserBoardData = async () => {
      try {
        const { data, error } = await supabase
          .from('boards')
          .select('tasks')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 means row not found
        if (data) {
          dispatch({ type: 'SET_TASKS', payload: data.tasks || [] });
        }
      } catch (err) {
        console.error('Core hydration error:', err.message);
      }
    };

    fetchUserBoardData();
  }, [user]);

  // 3. Automated Cloud Sync Engine (Debounced Database Updates)
  useEffect(() => {
    if (!user) return;

    const delayDebounceFn = setTimeout(async () => {
      try {
        await supabase
          .from('boards')
          .upsert({ user_id: user.id, tasks: state.tasks, updated_at: new Date().toISOString() });
      } catch (err) {
        console.error('Cloud synchronization execution failed:', err.message);
      }
    }, 700);

    return () => clearTimeout(delayDebounceFn);
  }, [state.tasks, user]);

  return (
    <TaskContext.Provider value={{ state, dispatch, user, loading }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) throw new Error('useTasks must be bundled within a TaskProvider layer.');
  return context;
}