import logging

def debug(message, worker=None) :
    logging.debug('{0}: {1}'.format(getWorkerId(worker), message))

def info(message, worker=None) :
    logging.info('{0}: {1}'.format(getWorkerId(worker), message))

def warn(message, worker=None) :
    logging.warn('{0}: {1}'.format(getWorkerId(worker), message))

def error(message, worker=None) :
    logging.error('{0}: {1}'.format(getWorkerId(worker), message))

def getWorkerId(worker) :
    if None != worker and hasattr(worker, 'uuid') :
        return str(worker.uuid).split('-')[-1]
    else :
        return 'main'
