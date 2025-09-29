import { useState, useCallback, useMemo } from 'react';

/**
 * Custom hook for analyzing dependency risks and blockers
 */
export const useDependencyAnalysis = (tasks) => {
  const [riskThresholds, setRiskThresholds] = useState({
    criticalPathDelay: 2, // days
    blockerAge: 3, // days
    dependencyChainLength: 5
  });

  // Create tasks lookup
  const tasksById = useMemo(() => 
    Object.fromEntries(tasks.map(task => [task.id, task])), 
    [tasks]
  );

  // Analyze dependency chains
  const analyzeDependencyChains = useCallback(() => {
    const chains = [];
    const visited = new Set();

    const buildChain = (taskId, currentChain = []) => {
      if (visited.has(taskId) || currentChain.includes(taskId)) {
        // Circular dependency detected
        return [...currentChain, taskId];
      }

      visited.add(taskId);
      const task = tasksById[taskId];
      if (!task || !task.depends || task.depends.length === 0) {
        return currentChain;
      }

      const longestChain = currentChain;
      task.depends.forEach(depId => {
        const chain = buildChain(depId, [...currentChain, taskId]);
        if (chain.length > longestChain.length) {
          longestChain.splice(0, longestChain.length, ...chain);
        }
      });

      return longestChain;
    };

    tasks.forEach(task => {
      if (!visited.has(task.id)) {
        const chain = buildChain(task.id);
        if (chain.length > 1) {
          chains.push(chain);
        }
      }
    });

    return chains;
  }, [tasks, tasksById]);

  // Identify blockers and their impact
  const analyzeBlockers = useCallback((task) => {
    const blockers = [];
    const now = new Date();

    // Check dependencies
    (task.depends || []).forEach(depId => {
      const dep = tasksById[depId];
      if (dep && dep.status !== 'done') {
        const blockerAge = Math.floor((now - new Date(dep.lastStatusUpdate || dep.createdAt || now)) / (1000 * 60 * 60 * 24));
        blockers.push({
          type: 'dependency',
          id: depId,
          name: dep.name,
          status: dep.status,
          owner: dep.owner,
          age: blockerAge,
          severity: blockerAge > riskThresholds.blockerAge ? 'high' : 'medium',
          impact: 'blocks_start'
        });
      }
    });

    // Check for explicit blockers
    (task.blockers || []).forEach(blocker => {
      const blockerAge = blocker.since ? Math.floor((now - new Date(blocker.since)) / (1000 * 60 * 60 * 24)) : 0;
      blockers.push({
        ...blocker,
        type: 'explicit',
        age: blockerAge,
        severity: blockerAge > riskThresholds.blockerAge ? 'high' : 'medium'
      });
    });

    return blockers;
  }, [tasksById, riskThresholds.blockerAge]);

  // Calculate critical path risks
  const calculateCriticalPathRisks = useCallback(() => {
    const chains = analyzeDependencyChains();
    const risks = [];

    chains.forEach(chain => {
      if (chain.length > riskThresholds.dependencyChainLength) {
        const totalDuration = chain.reduce((sum, taskId) => {
          const task = tasksById[taskId];
          return sum + (task?.duration || 0);
        }, 0);

        const blockedTasks = chain.filter(taskId => {
          const task = tasksById[taskId];
          return task && task.status === 'blocked';
        });

        if (blockedTasks.length > 0) {
          risks.push({
            type: 'critical_path',
            chain,
            totalDuration,
            blockedTasks,
            severity: blockedTasks.length > 2 ? 'high' : 'medium',
            impact: 'project_delay'
          });
        }
      }
    });

    return risks;
  }, [analyzeDependencyChains, tasksById, riskThresholds.dependencyChainLength]);

  // Get escalation recommendations
  const getEscalationRecommendations = useCallback((task) => {
    const blockers = analyzeBlockers(task);
    const recommendations = [];

    blockers.forEach(blocker => {
      if (blocker.severity === 'high') {
        recommendations.push({
          type: 'escalate',
          priority: 'high',
          action: `Escalate blocker: ${blocker.name}`,
          assignee: blocker.owner || 'Unassigned',
          reason: `Blocked for ${blocker.age} days`
        });
      }

      if (blocker.type === 'dependency' && blocker.status === 'blocked') {
        recommendations.push({
          type: 'investigate',
          priority: 'medium',
          action: `Investigate dependency blocker: ${blocker.name}`,
          assignee: blocker.owner || 'Unassigned',
          reason: 'Dependency is blocked'
        });
      }
    });

    return recommendations;
  }, [analyzeBlockers]);

  // Get overall risk summary
  const getRiskSummary = useCallback(() => {
    const criticalPathRisks = calculateCriticalPathRisks();
    const highRiskTasks = tasks.filter(task => {
      const blockers = analyzeBlockers(task);
      return blockers.some(b => b.severity === 'high');
    });

    return {
      totalTasks: tasks.length,
      highRiskTasks: highRiskTasks.length,
      criticalPathRisks: criticalPathRisks.length,
      overallRiskLevel: highRiskTasks.length > tasks.length * 0.3 ? 'high' : 
                       highRiskTasks.length > tasks.length * 0.1 ? 'medium' : 'low',
      recommendations: highRiskTasks.flatMap(task => getEscalationRecommendations(task))
    };
  }, [tasks, calculateCriticalPathRisks, analyzeBlockers, getEscalationRecommendations]);

  return {
    analyzeBlockers,
    calculateCriticalPathRisks,
    getEscalationRecommendations,
    getRiskSummary,
    riskThresholds,
    setRiskThresholds
  };
};
