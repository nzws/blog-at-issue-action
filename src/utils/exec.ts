import { resolve as pathResolve } from 'path';
import { exec as GHExec, ExecOptions } from '@actions/exec';

const exec = async (
  commandLine: string,
  args?: string[],
  options?: ExecOptions
): Promise<number> => {
  const directory = pathResolve(__dirname, 'project');

  return GHExec(commandLine, args, {
    failOnStdErr: true,
    cwd: directory,
    ...(options || {})
  });
};

export default exec;
